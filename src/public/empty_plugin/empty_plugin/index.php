<?php
/*
Plugin Name: Empty Plugin
Plugin URI: https://wordpress.org/plugins/empty_plugin/
Description: Empty Plugin for upgrade test
Version: 1.0.7
Author: TechNinjas
Author URI: http://github.com/techninjas514
Text Domain: empty_plugin
Domain Path: /languages
*/
define( 'MY_PLUGIN_VERSION', '1.0.7' );
define( 'MY_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );
define( 'MY_PLUGIN_SLUG', 'empty_plugin' );
add_filter( 'pre_set_site_transient_update_plugins', 'my_plugin_update_checker' );
function my_plugin_update_checker( $transient ) {
    // Check for updates...
    $metadata_url = 'http://begintrust.com/empty_plugin/update.json?t='.time();
    $response = wp_remote_get( $metadata_url );
    if ( ! is_wp_error( $response ) ) {
        $metadata = json_decode( wp_remote_retrieve_body( $response ) );
        if ( ! empty( $metadata ) && version_compare( $metadata->new_version, MY_PLUGIN_VERSION, '>' ) ) {
            $transient->response[ MY_PLUGIN_BASENAME ] = (object) array(
                'new_version' => $metadata->new_version,
                'package'     => $metadata->download_url,
                'slug'        => MY_PLUGIN_SLUG,
            );
        }
    }
    return $transient;
}