import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Linking, Platform } from 'react-native';
import { getSiteSettings } from '../services/api';
import Icon from 'react-native-vector-icons/Feather';

const CURRENT_APP_VERSION = '3.0'; // Matches android/app/build.gradle versionName

// Helper to compare semantic versions (e.g., '1.0.1' > '1.0.0')
const isVersionGreater = (newVersion, currentVersion) => {
    if (!newVersion || !currentVersion) return false;
    const v1Parts = newVersion.split('.').map(Number);
    const v2Parts = currentVersion.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
        const p1 = v1Parts[i] || 0;
        const p2 = v2Parts[i] || 0;
        if (p1 > p2) return true;
        if (p1 < p2) return false;
    }
    return false;
};

const AppUpdatePrompt = () => {
    const [visible, setVisible] = useState(false);
    const [updateInfo, setUpdateInfo] = useState(null);

    useEffect(() => {
        checkAppUpdate();
    }, []);

    const checkAppUpdate = async () => {
        try {
            const result = await getSiteSettings();
            if (result && result.success && result.settings) {
                const settings = result.settings;
                const platformVersion = Platform.OS === 'ios' ? settings.ios_app_version : settings.android_app_version;
                const platformUrl = Platform.OS === 'ios' ? settings.ios_app_url : settings.android_app_url;
                const forceUpdate = settings.force_update;

                if (isVersionGreater(platformVersion, CURRENT_APP_VERSION)) {
                    setUpdateInfo({
                        version: platformVersion,
                        url: platformUrl,
                        forceUpdate: forceUpdate
                    });
                    setVisible(true);
                }
            }
        } catch (error) {
            console.error('Failed to check app update:', error);
        }
    };

    const handleUpdate = () => {
        if (updateInfo?.url) {
            Linking.openURL(updateInfo.url).catch((err) => {
                console.error("Failed to open URL:", err);
            });
        }
    };

    const handleLater = () => {
        if (!updateInfo?.forceUpdate) {
            setVisible(false);
        }
    };

    if (!visible || !updateInfo) return null;

    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={visible}
            onRequestClose={handleLater}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.iconContainer}>
                        <Icon name="download-cloud" size={40} color="#f97316" />
                    </View>
                    
                    <Text style={styles.title}>Update Available!</Text>
                    
                    <Text style={styles.message}>
                        A new version of Local Market ({updateInfo.version}) is available. 
                        Please update to get the latest features and improvements.
                    </Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
                            <Text style={styles.updateButtonText}>Update Now</Text>
                        </TouchableOpacity>

                        {!updateInfo.forceUpdate && (
                            <TouchableOpacity style={styles.laterButton} onPress={handleLater}>
                                <Text style={styles.laterButtonText}>Maybe Later</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 340,
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 10,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff7ed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: '#4b5563',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    updateButton: {
        backgroundColor: '#f97316',
        width: '100%',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    updateButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    laterButton: {
        width: '100%',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    laterButtonText: {
        color: '#6b7280',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default AppUpdatePrompt;
