<?php
/**
 * Plugin Name: WooCommerce Live Sales Counter – Ultimate Sales & Analytics Edition
 * Plugin URI: https://strrobin.shop/portfolio
 * Description: Real-time order statistics, social proof notifications, and 100+ visual templates for WooCommerce.
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
 * Main Plugin Class
 */
class WC_Live_Sales_Counter_Ultimate {

    public function __construct() {
        add_action( 'plugins_loaded', array( $this, 'init' ) );
    }

    public function init() {
        if ( ! class_exists( 'WooCommerce' ) ) {
            add_action( 'admin_notices', array( $this, 'woocommerce_missing_notice' ) );
            return;
        }

        add_shortcode( 'woo_rara_stats', array( $this, 'render_shortcode' ) );
        add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
        add_action( 'wp_footer', array( $this, 'render_notification_popup' ) );
        add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
    }

    public function register_rest_routes() {
        register_rest_route( 'wros/v1', '/settings', array(
            'methods' => 'POST',
            'callback' => array( $this, 'save_settings' ),
            'permission_callback' => function() {
                return current_user_can( 'manage_options' );
            }
        ) );
    }

    public function save_settings( $request ) {
        $params = $request->get_json_params();
        if ( empty( $params ) ) {
            return new WP_Error( 'no_data', 'No data provided', array( 'status' => 400 ) );
        }

        foreach ( $params as $key => $value ) {
            update_option( 'wros_' . $key, $value );
        }

        return rest_ensure_response( array( 'success' => true ) );
    }

    public function woocommerce_missing_notice() {
        ?>
        <div class="error notice">
            <p><?php _e( 'WooCommerce Live Sales Counter requires WooCommerce to be installed and active.', 'wros' ); ?></p>
        </div>
        <?php
    }

    public function add_admin_menu() {
        add_menu_page(
            'Live Sales Counter',
            'Live Sales Counter',
            'manage_options',
            'wc-live-sales-counter',
            array( $this, 'render_admin_page' ),
            'dashicons-chart-line',
            56
        );
    }

    public function render_admin_page() {
        ?>
        <div class="wrap">
            <div id="root"></div>
        </div>
        <?php
    }

    public function enqueue_admin_assets( $hook ) {
        if ( 'toplevel_page_wc-live-sales-counter' !== $hook ) {
            return;
        }

        wp_enqueue_style( 'wros-admin-css', plugin_dir_url( __FILE__ ) . 'dist/assets/index.css', array(), '1.0.0' );
        wp_enqueue_script( 'wros-admin-js', plugin_dir_url( __FILE__ ) . 'dist/assets/index.js', array(), '1.0.0', true );

        // Pass data to React
        wp_localize_script( 'wros-admin-js', 'wrosData', array(
            'nonce' => wp_create_nonce( 'wp_rest' ),
            'apiUrl' => get_rest_url( null, 'wros/v1' ),
            'settings' => $this->get_all_settings()
        ) );
    }    private function get_all_settings() {
        return array(
            'template' => get_option( 'wros_template', 'style-1' ),
            'mode' => get_option( 'wros_mode', 'analytics' ),
            'enabledStatuses' => get_option( 'wros_enabledStatuses', array( 'pending' => true, 'processing' => true, 'completed' => true, 'onHold' => true ) ),
            'demoStats' => get_option( 'wros_demoStats', array( 'pending' => '15', 'processing' => '42', 'completed' => '5,000+', 'onHold' => '8' ) ),
            'notifications' => get_option( 'wros_notifications', array( 'enabled' => true, 'position' => 'bottom-right', 'interval' => 5000, 'fakeOrders' => true ) ),
            'responsive' => get_option( 'wros_responsive', array(
                'desktop' => array( 'columns' => 4, 'fontSize' => 24, 'fontFamily' => 'Inter', 'fontWeight' => '700', 'lineHeight' => 1.2, 'letterSpacing' => 0, 'padding' => 20, 'margin' => 10, 'gap' => 20, 'iconSize' => 40, 'iconColor' => '#6366f1', 'iconBgEnabled' => true, 'iconBgShape' => 'circle' ),
                'tablet' => array( 'columns' => 2, 'fontSize' => 20, 'fontFamily' => 'Inter', 'fontWeight' => '600', 'lineHeight' => 1.2, 'letterSpacing' => 0, 'padding' => 15, 'margin' => 8, 'gap' => 15, 'iconSize' => 30, 'iconColor' => '#6366f1', 'iconBgEnabled' => true, 'iconBgShape' => 'circle' ),
                'mobile' => array( 'columns' => 1, 'fontSize' => 18, 'fontFamily' => 'Inter', 'fontWeight' => '600', 'lineHeight' => 1.2, 'letterSpacing' => 0, 'padding' => 10, 'margin' => 5, 'gap' => 10, 'iconSize' => 25, 'iconColor' => '#6366f1', 'iconBgEnabled' => true, 'iconBgShape' => 'circle' ),
            ) ),
            'colors' => get_option( 'wros_colors', array( 'primary' => '#6366f1', 'secondary' => '#4f46e5', 'text' => '#111827', 'background' => '#ffffff' ) ),
            'customCss' => get_option( 'wros_customCss', '' ),
        );
    }

    private function enqueue_google_fonts() {
        $responsive = get_option( 'wros_responsive', array() );
        if ( empty( $responsive ) ) return;
        
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

    public function render_shortcode( $atts ) {
        $this->enqueue_google_fonts();
        $stats = $this->get_order_stats();
        $template = get_option( 'wros_template', 'style-1' );
        $custom_css = get_option( 'wros_customCss', '' );
        $responsive = get_option( 'wros_responsive', array(
            'desktop' => array( 'columns' => 4, 'fontSize' => 24, 'fontFamily' => 'Inter', 'fontWeight' => '700', 'lineHeight' => 1.2, 'letterSpacing' => 0, 'padding' => 20, 'margin' => 10, 'gap' => 20, 'iconSize' => 40, 'iconColor' => '#6366f1', 'iconBgEnabled' => true, 'iconBgShape' => 'circle' ),
            'tablet' => array( 'columns' => 2, 'fontSize' => 20, 'fontFamily' => 'Inter', 'fontWeight' => '600', 'lineHeight' => 1.2, 'letterSpacing' => 0, 'padding' => 15, 'margin' => 8, 'gap' => 15, 'iconSize' => 30, 'iconColor' => '#6366f1', 'iconBgEnabled' => true, 'iconBgShape' => 'circle' ),
            'mobile' => array( 'columns' => 1, 'fontSize' => 18, 'fontFamily' => 'Inter', 'fontWeight' => '600', 'lineHeight' => 1.2, 'letterSpacing' => 0, 'padding' => 10, 'margin' => 5, 'gap' => 10, 'iconSize' => 25, 'iconColor' => '#6366f1', 'iconBgEnabled' => true, 'iconBgShape' => 'circle' ),
        ) );
        $colors = get_option( 'wros_colors', array( 'primary' => '#6366f1', 'secondary' => '#4f46e5', 'text' => '#111827', 'background' => '#ffffff' ) );
        
        ob_start();
        ?>
        <style>
            .wros-container {
                --wros-primary: <?php echo esc_attr( $colors['primary'] ); ?>;
                --wros-text: <?php echo esc_attr( $colors['text'] ); ?>;
                width: 100%;
            }
            .wros-grid { 
                display: grid; 
                width: 100%; 
                grid-template-columns: repeat(<?php echo esc_attr( $responsive['desktop']['columns'] ); ?>, minmax(0, 1fr));
                gap: <?php echo esc_attr( $responsive['desktop']['gap'] ); ?>px;
            }
            .wros-stat-card {
                display: flex; flex-direction: column; align-items: center; text-align: center;
                transition: all 0.3s ease; background: #fff; border: 1px solid #f3f4f6;
                border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                padding: <?php echo esc_attr( $responsive['desktop']['padding'] ); ?>px;
                margin: <?php echo esc_attr( $responsive['desktop']['margin'] ); ?>px;
            }
            .wros-icon-wrapper {
                width: <?php echo esc_attr( $responsive['desktop']['iconSize'] * 1.5 ); ?>px;
                height: <?php echo esc_attr( $responsive['desktop']['iconSize'] * 1.5 ); ?>px;
                display: flex; align-items: center; justify-content: center;
                border-radius: <?php echo $responsive['desktop']['iconBgShape'] === 'circle' ? '50%' : '12px'; ?>;
                margin-bottom: 1rem;
                background: <?php echo $responsive['desktop']['iconBgEnabled'] ? esc_attr( $responsive['desktop']['iconColor'] ) . '15' : 'transparent'; ?>;
                color: <?php echo esc_attr( $responsive['desktop']['iconColor'] ); ?>;
            }
            .wros-icon-wrapper svg { 
                width: <?php echo esc_attr( $responsive['desktop']['iconSize'] ); ?>px; 
                height: <?php echo esc_attr( $responsive['desktop']['iconSize'] ); ?>px; 
            }
            .wros-label { font-size: 0.875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; opacity: 0.7; }
            .wros-value { 
                font-weight: <?php echo esc_attr( $responsive['desktop']['fontWeight'] ); ?>; 
                font-size: <?php echo esc_attr( $responsive['desktop']['fontSize'] ); ?>px;
                font-family: <?php echo esc_attr( $responsive['desktop']['fontFamily'] ); ?>;
                line-height: <?php echo esc_attr( $responsive['desktop']['lineHeight'] ); ?>;
                letter-spacing: <?php echo esc_attr( $responsive['desktop']['letterSpacing'] ); ?>px;
            }

            /* Template Styles */
            .wros-template-style-11 .wros-stat-card, .wros-template-style-12 .wros-stat-card, .wros-template-style-13 .wros-stat-card, .wros-template-style-14 .wros-stat-card, .wros-template-style-15 .wros-stat-card, .wros-template-style-16 .wros-stat-card, .wros-template-style-17 .wros-stat-card, .wros-template-style-18 .wros-stat-card, .wros-template-style-19 .wros-stat-card, .wros-template-style-20 .wros-stat-card {
                border-radius: 1.5rem; border-bottom: 4px solid var(--wros-primary); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            }
            .wros-template-style-21 .wros-stat-card, .wros-template-style-22 .wros-stat-card, .wros-template-style-23 .wros-stat-card, .wros-template-style-24 .wros-stat-card, .wros-template-style-25 .wros-stat-card, .wros-template-style-26 .wros-stat-card, .wros-template-style-27 .wros-stat-card, .wros-template-style-28 .wros-stat-card, .wros-template-style-29 .wros-stat-card, .wros-template-style-30 .wros-stat-card {
                background: linear-gradient(135deg, var(--wros-primary), #4f46e5); color: white; border: none;
            }
            .wros-template-style-21 .wros-label, .wros-template-style-21 .wros-value, .wros-template-style-22 .wros-label, .wros-template-style-22 .wros-value, .wros-template-style-23 .wros-label, .wros-template-style-23 .wros-value, .wros-template-style-24 .wros-label, .wros-template-style-24 .wros-value, .wros-template-style-25 .wros-label, .wros-template-style-25 .wros-value, .wros-template-style-26 .wros-label, .wros-template-style-26 .wros-value, .wros-template-style-27 .wros-label, .wros-template-style-27 .wros-value, .wros-template-style-28 .wros-label, .wros-template-style-28 .wros-value, .wros-template-style-29 .wros-label, .wros-template-style-29 .wros-value, .wros-template-style-30 .wros-label, .wros-template-style-30 .wros-value { color: white; }
            .wros-template-style-21 .wros-icon-wrapper, .wros-template-style-22 .wros-icon-wrapper, .wros-template-style-23 .wros-icon-wrapper, .wros-template-style-24 .wros-icon-wrapper, .wros-template-style-25 .wros-icon-wrapper, .wros-template-style-26 .wros-icon-wrapper, .wros-template-style-27 .wros-icon-wrapper, .wros-template-style-28 .wros-icon-wrapper, .wros-template-style-29 .wros-icon-wrapper, .wros-template-style-30 .wros-icon-wrapper { background: rgba(255,255,255,0.2); color: white; }
            
            .wros-template-style-41 .wros-stat-card, .wros-template-style-42 .wros-stat-card, .wros-template-style-43 .wros-stat-card, .wros-template-style-44 .wros-stat-card, .wros-template-style-45 .wros-stat-card, .wros-template-style-46 .wros-stat-card, .wros-template-style-47 .wros-stat-card, .wros-template-style-48 .wros-stat-card, .wros-template-style-49 .wros-stat-card, .wros-template-style-50 .wros-stat-card {
                background: #09090b; border: 1px solid #06b6d4; box-shadow: 0 0 20px rgba(6,182,212,0.2); color: #06b6d4;
            }
            .wros-template-style-41 .wros-label, .wros-template-style-41 .wros-value { color: #06b6d4; }

            .wros-template-style-51 .wros-stat-card, .wros-template-style-52 .wros-stat-card, .wros-template-style-53 .wros-stat-card, .wros-template-style-54 .wros-stat-card, .wros-template-style-55 .wros-stat-card, .wros-template-style-56 .wros-stat-card, .wros-template-style-57 .wros-stat-card, .wros-template-style-58 .wros-stat-card, .wros-template-style-59 .wros-stat-card, .wros-template-style-60 .wros-stat-card {
                background: #facc15; border: 4px solid black; border-radius: 0; shadow: 8px 8px 0px 0px black;
            }
            
            <?php 
            foreach ( array( 'tablet' => '(min-width: 769px) and (max-width: 1024px)', 'mobile' => '(max-width: 768px)' ) as $key => $query ) : 
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
                }
                .wros-icon-wrapper {
                    width: <?php echo esc_attr( $settings['iconSize'] * 1.5 ); ?>px !important;
                    height: <?php echo esc_attr( $settings['iconSize'] * 1.5 ); ?>px !important;
                    color: <?php echo esc_attr( $settings['iconColor'] ); ?> !important;
                    background: <?php echo $settings['iconBgEnabled'] ? esc_attr( $settings['iconColor'] ) . '15' : 'transparent'; ?> !important;
                    border-radius: <?php echo $settings['iconBgShape'] === 'circle' ? '50%' : '12px'; ?> !important;
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
                    'onHold'     => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>',
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
            document.querySelectorAll('.wros-value').forEach(el => {
                const targetStr = el.getAttribute('data-target');
                const target = parseInt(targetStr.replace(/[^0-9]/g, '')) || 0;
                const suffix = targetStr.replace(/[0-9]/g, '');
                let count = 0;
                const duration = 2000;
                if (target === 0) { el.innerText = targetStr; return; }
                const increment = target / (duration / 16);
                const timer = setInterval(() => {
                    count += increment;
                    if (count >= target) { el.innerText = target + suffix; clearInterval(timer); } 
                    else { el.innerText = Math.floor(count) + suffix; }
                }, 16);
            });
        </script>
        <?php
        return ob_get_clean();
    }

    private function get_order_stats() {
        $mode = get_option( 'wros_mode', 'analytics' );
        $enabled_statuses_opt = get_option( 'wros_enabledStatuses', array( 'pending' => true, 'processing' => true, 'completed' => true, 'onHold' => true ) );
        $stats = array();
        
        $status_map = array(
            'pending'    => 'pending',
            'processing' => 'processing',
            'completed'  => 'completed',
            'onHold'     => 'on-hold'
        );

        foreach ( $enabled_statuses_opt as $status => $enabled ) {
            if ( ! $enabled ) continue;
            
            if ( $mode === 'demo' ) {
                $demo_stats = get_option( 'wros_demoStats', array( 'pending' => '15', 'processing' => '42', 'completed' => '5,000+', 'onHold' => '8' ) );
                $stats[$status] = isset( $demo_stats[$status] ) ? $demo_stats[$status] : '0';
            } else {
                $wc_status = isset( $status_map[$status] ) ? $status_map[$status] : $status;
                $args = array( 'status' => $wc_status, 'return' => 'ids' );
                $query = new WC_Order_Query( $args );
                $stats[$status] = count( $query->get_orders() );
            }
        }
        return $stats;
    }

    public function render_notification_popup() {
        $enabled = get_option( 'wros_notifications_enabled', 'yes' );
        if ( $enabled !== 'yes' ) return;
        $customer = $this->get_recent_customer();
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
            .wros-notification { position: fixed; <?php echo $pos_css; ?> z-index: 99999; background: white; padding: 12px 20px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 12px; transform: translateY(100px); opacity: 0; transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55); border: 1px solid #f3f4f6; max-width: 300px; }
            .wros-notification.active { transform: translateY(0); opacity: 1; }
            .wros-notif-icon { background: #ecfdf5; color: #10b981; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
            .wros-notif-content { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
            .wros-notif-title { font-size: 13px; font-weight: 700; color: #111827; margin: 0; }
            .wros-notif-desc { font-size: 11px; color: #6b7280; margin: 0; }
        </style>
        <div id="wros-notification" class="wros-notification">
            <div class="wros-notif-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>
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
                    setTimeout(() => { notif.classList.remove('active'); }, 5000);
                }, <?php echo intval( $interval ); ?>);
            });
        </script>
        <?php
    }

    private function get_recent_customer() {
        $args = array( 'limit' => 1, 'orderby' => 'date', 'order' => 'DESC', 'status' => 'completed' );
        $query = new WC_Order_Query( $args );
        $orders = $query->get_orders();
        if ( ! empty( $orders ) ) {
            $order = $orders[0];
            return array( 'name' => $order->get_billing_first_name(), 'city' => $order->get_billing_city() );
        }
        return false;
    }
}

new WC_Live_Sales_Counter_Ultimate();
