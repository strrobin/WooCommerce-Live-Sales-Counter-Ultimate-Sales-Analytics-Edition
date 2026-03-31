<?php
/**
 * Plugin Name: WooCommerce Real-time Order Stats (WROS)
 * Plugin URI: https://strrobin.shop/portfolio
 * Description: Displays real-time order statistics with 10+ visual templates and social proof notifications.
 * Version: 1.0.0
 * Author: STR ROBIN
 * Author URI: https://strrobin.shop/portfolio
 * License: GPL2
 * 
 * Developed by STR ROBIN (https://strrobin.shop/portfolio)
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

/**
 * Check if WooCommerce is active
 */
function wros_check_woocommerce_dependency() {
    if ( ! class_exists( 'WooCommerce' ) ) {
        add_action( 'admin_notices', 'wros_woocommerce_missing_notice' );
        return false;
    }
    return true;
}

function wros_woocommerce_missing_notice() {
    ?>
    <div class="error notice">
        <p><?php _e( 'WooCommerce Real-time Order Stats (WROS) requires WooCommerce to be installed and active.', 'wros' ); ?></p>
    </div>
    <?php
}

if ( wros_check_woocommerce_dependency() ) {
    require_once plugin_dir_path( __FILE__ ) . 'admin-settings.php';

    /**
     * Core logic to fetch order counts
     */
    function wros_get_order_stats() {
        $mode = get_option( 'wros_mode', 'analytics' );
        $enabled_statuses = get_option( 'wros_enabled_statuses', array( 'pending', 'processing', 'completed', 'on-hold' ) );
        
        $stats = array();

        foreach ( $enabled_statuses as $status ) {
            if ( $mode === 'demo' ) {
                $stats[$status] = get_option( "wros_demo_{$status}", '0' );
            } else {
                // Analytics Mode (Last 168 Hours / 7 Days)
                $args = array(
                    'status'       => $status,
                    'date_created' => '>' . ( time() - ( 168 * HOUR_IN_SECONDS ) ),
                    'return'       => 'ids',
                );
                $query = new WC_Order_Query( $args );
                $orders = $query->get_orders();
                $stats[$status] = count( $orders );
            }
        }

        return $stats;
    }

    /**
     * Fetch most recent customer for notification
     */
    function wros_get_recent_customer() {
        $args = array(
            'limit'   => 1,
            'orderby' => 'date',
            'order'   => 'DESC',
            'status'  => 'completed',
        );
        $query = new WC_Order_Query( $args );
        $orders = $query->get_orders();

        if ( ! empty( $orders ) ) {
            $order = $orders[0];
            return array(
                'name' => $order->get_billing_first_name(),
                'city' => $order->get_billing_city(),
            );
        }

        return false;
    }

    /**
     * Enqueue Google Fonts
     */
    function wros_enqueue_google_fonts() {
        $responsive = get_option( 'wros_responsive', array() );
        $fonts_to_load = array();

        foreach ( $responsive as $device => $settings ) {
            if ( ! empty( $settings['fontFamily'] ) && $settings['fontFamily'] !== 'system-ui' && $settings['fontFamily'] !== 'Inter' ) {
                $fonts_to_load[] = $settings['fontFamily'];
            }
        }

        if ( ! empty( $fonts_to_load ) ) {
            $fonts_to_load = array_unique( $fonts_to_load );
            $font_query = implode( '|', array_map( function( $font ) {
                return str_replace( ' ', '+', $font ) . ':300,400,500,600,700,900';
            }, $fonts_to_load ) );
            
            wp_enqueue_style( 'wros-google-fonts', 'https://fonts.googleapis.com/css?family=' . $font_query . '&display=swap' );
        }
    }

    /**
     * Shortcode [woo_rara_stats]
     */
    add_shortcode( 'woo_rara_stats', 'wros_render_stats_shortcode' );
    function wros_render_stats_shortcode( $atts ) {
        wros_enqueue_google_fonts();
        $stats = wros_get_order_stats();
        $template = get_option( 'wros_template', 'style-1' );
        $custom_css = get_option( 'wros_custom_css', '' );
        
        $responsive = get_option( 'wros_responsive', array() );
        
        ob_start();
        ?>
        <style>
            .wros-container {
                --wros-primary: <?php echo esc_attr( get_option( 'wros_primary_color', '#6366f1' ) ); ?>;
                --wros-text: <?php echo esc_attr( get_option( 'wros_text_color', '#111827' ) ); ?>;
                width: 100%;
            }
            .wros-grid {
                display: grid;
                width: 100%;
            }
            .wros-stat-card {
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                transition: all 0.3s ease;
                background: #fff;
                border: 1px solid #f3f4f6;
                border-radius: 1rem;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .wros-icon-wrapper {
                padding: 0.75rem;
                border-radius: 9999px;
                margin-bottom: 1rem;
                background: #f3f4f6;
                color: var(--wros-primary);
            }
            .wros-icon-wrapper svg {
                width: 1.5rem;
                height: 1.5rem;
            }
            .wros-label {
                font-size: 0.875rem;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-bottom: 0.25rem;
                opacity: 0.7;
            }
            .wros-value {
                font-weight: 700;
                letter-spacing: -0.025em;
            }
            
            <?php 
            foreach ( array( 'desktop' => '(min-width: 1025px)', 'tablet' => '(min-width: 769px) and (max-width: 1024px)', 'mobile' => '(max-width: 768px)' ) as $key => $query ) : 
                $settings = isset( $responsive[$key] ) ? $responsive[$key] : array();
                if ( empty( $settings ) ) continue;
            ?>
            @media <?php echo $query; ?> {
                .wros-grid {
                    grid-template-columns: repeat(<?php echo esc_attr( $settings['columns'] ); ?>, minmax(0, 1fr)) !important;
                    gap: <?php echo esc_attr( $settings['gap'] ); ?>px !important;
                }
                .wros-stat-value {
                    font-size: <?php echo esc_attr( $settings['fontSize'] ); ?>px !important;
                    font-family: <?php echo esc_attr( $settings['fontFamily'] ); ?> !important;
                    font-weight: <?php echo esc_attr( $settings['fontWeight'] ); ?> !important;
                    line-height: <?php echo esc_attr( $settings['lineHeight'] ); ?> !important;
                    letter-spacing: <?php echo esc_attr( $settings['letterSpacing'] ); ?>px !important;
                }
                .wros-stat-card {
                    padding: <?php echo esc_attr( $settings['padding'] ); ?>px !important;
                    margin: <?php echo esc_attr( $settings['margin'] ); ?>px !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                }
                .wros-icon-wrapper {
                    width: <?php echo esc_attr( $settings['iconSize'] * 1.5 ); ?>px !important;
                    height: <?php echo esc_attr( $settings['iconSize'] * 1.5 ); ?>px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    color: <?php echo esc_attr( $settings['iconColor'] ); ?> !important;
                    background: <?php echo $settings['iconBgEnabled'] ? esc_attr( $settings['iconColor'] ) . '15' : 'transparent'; ?> !important;
                    border-radius: <?php echo $settings['iconBgShape'] === 'circle' ? '50%' : '12px'; ?> !important;
                    margin-bottom: 1rem !important;
                }
                .wros-icon-wrapper svg {
                    width: <?php echo esc_attr( $settings['iconSize'] ); ?>px !important;
                    height: <?php echo esc_attr( $settings['iconSize'] ); ?>px !important;
                }
            }
            <?php endforeach; ?>

            <?php echo wp_kses_post( $custom_css ); ?>
        </style>
        <div class="wros-container wros-template-<?php echo esc_attr( $template ); ?>">
            <div class="wros-grid">
                <?php 
                $icons = array(
                    'pending'    => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
                    'processing' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-bag"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
                    'completed'  => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
                    'on-hold'    => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>',
                );

                foreach ( $stats as $status => $value ) {
                    $icon = isset( $icons[$status] ) ? $icons[$status] : '';
                    echo '<div class="wros-stat-card">';
                    echo '<div class="wros-icon-wrapper">' . $icon . '</div>';
                    echo '<span class="wros-label">' . esc_html( ucfirst( $status ) ) . '</span>';
                    echo '<span class="wros-value wros-stat-value" data-target="' . esc_attr( $value ) . '">0</span>';
                    echo '</div>';
                }
                ?>
            </div>
        </div>
        <script>
            // Vanilla JS 0 to Target Counter
            document.querySelectorAll('.wros-value').forEach(el => {
                const target = parseInt(el.getAttribute('data-target'));
                let count = 0;
                const duration = 2000;
                const increment = target / (duration / 16);
                const timer = setInterval(() => {
                    count += increment;
                    if (count >= target) {
                        el.innerText = target;
                        clearInterval(timer);
                    } else {
                        el.innerText = Math.floor(count);
                    }
                }, 16);
            });
        </script>
        <?php
        return ob_get_clean();
    }

    /**
     * Live Notification Popup
     */
    add_action( 'wp_footer', 'wros_render_notification_popup' );
    function wros_render_notification_popup() {
        $enabled = get_option( 'wros_notifications_enabled', 'yes' );
        if ( $enabled !== 'yes' ) return;

        $customer = wros_get_recent_customer();
        if ( ! $customer ) return;

        $position = get_option( 'wros_notifications_position', 'bottom-left' );
        $interval = get_option( 'wros_notifications_interval', 5000 );

        $pos_css = '';
        switch ( $position ) {
            case 'top-left': $pos_css = 'top: 20px; left: 20px;'; break;
            case 'top-right': $pos_css = 'top: 20px; right: 20px;'; break;
            case 'bottom-right': $pos_css = 'bottom: 20px; right: 20px;'; break;
            default: $pos_css = 'bottom: 20px; left: 20px;'; break;
        }
        ?>
        <style>
            .wros-notification {
                position: fixed;
                <?php echo $pos_css; ?>
                z-index: 99999;
                background: white;
                padding: 12px 20px;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                gap: 12px;
                transform: translateY(100px);
                opacity: 0;
                transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                border: 1px solid #f3f4f6;
                max-width: 300px;
            }
            .wros-notification.active {
                transform: translateY(0);
                opacity: 1;
            }
            .wros-notif-icon {
                background: #ecfdf5;
                color: #10b981;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .wros-notif-content {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }
            .wros-notif-title {
                font-size: 13px;
                font-weight: 700;
                color: #111827;
                margin: 0;
            }
            .wros-notif-desc {
                font-size: 11px;
                color: #6b7280;
                margin: 0;
            }
        </style>
        <div id="wros-notification" class="wros-notification">
            <div class="wros-notif-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <div class="wros-notif-content">
                <p class="wros-notif-title"><?php echo esc_html( $customer['name'] ); ?> from <?php echo esc_html( $customer['city'] ); ?></p>
                <p class="wros-notif-desc">Just placed an order!</p>
            </div>
        </div>
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                const notif = document.getElementById('wros-notification');
                if (!notif) return;

                setTimeout(() => {
                    notif.classList.add('active');
                    setTimeout(() => {
                        notif.classList.remove('active');
                    }, 5000);
                }, <?php echo intval( $interval ); ?>);
            });
        </script>
        <?php
    }
}
