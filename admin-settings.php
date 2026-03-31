<?php
/**
 * Admin Settings Page for WROS
 * Developed by STR ROBIN
 */

add_action( 'admin_menu', 'wros_add_admin_menu' );
function wros_add_admin_menu() {
    add_menu_page(
        'WROS Settings',
        'WROS Stats',
        'manage_options',
        'wros-settings',
        'wros_render_settings_page',
        'dashicons-chart-area',
        30
    );
}

function wros_render_settings_page() {
    ?>
    <div class="wrap wros-admin-wrap">
        <h1>WROS - WooCommerce Real-time Order Stats</h1>
        <div class="wros-shortcode-copy">
            <code>[woo_rara_stats]</code>
            <button class="button" onclick="copyWrosShortcode()">Click to Copy</button>
        </div>
        <!-- Settings form would go here -->
        <p>Developed by <a href="https://strrobin.shop/portfolio">STR ROBIN</a></p>
    </div>
    <script>
    function copyWrosShortcode() {
        navigator.clipboard.writeText('[woo_rara_stats]');
        alert('Shortcode copied!');
    }
    </script>
    <?php
}
