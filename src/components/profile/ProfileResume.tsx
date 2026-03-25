import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ProfileResume = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.sectionHeader}>PROFESSIONAL RESUME</Text>

            <View style={styles.resumeCard}>
                <View style={styles.resumeHeader}>
                    <View style={styles.pdfIcon}>
                        <Text style={styles.pdfText}>PDF</Text>
                    </View>
                    <View>
                        <Text style={styles.resumeName}>Alex_Rivera_CV_2024.pdf</Text>
                        <Text style={styles.resumeDate}>Updated Oct 12, 2024</Text>
                    </View>
                </View>

                <View style={styles.resumeActions}>
                    <TouchableOpacity style={styles.previewButton}>
                        <Icon name="eye" size={18} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={styles.previewButtonText}>Preview</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.downloadButton}>
                        <Icon name="download" size={18} color="#4A6D8C" style={{ marginRight: 6 }} />
                        <Text style={styles.downloadButtonText}>Download</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
        marginBottom: 12,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    resumeCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    resumeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    pdfIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    pdfText: {
        fontSize: 12,
        fontWeight: '900',
        color: '#4A6D8C',
    },
    resumeName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 4,
    },
    resumeDate: {
        fontSize: 13,
        color: '#94A3B8',
        fontStyle: 'italic',
    },
    resumeActions: {
        flexDirection: 'row',
        gap: 12,
    },
    previewButton: {
        flex: 1,
        backgroundColor: '#4A6D8C',
        paddingVertical: 12,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    downloadButton: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        paddingVertical: 12,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    downloadButtonText: {
        color: '#4A6D8C',
        fontWeight: '600',
        fontSize: 14,
    },
});

export default ProfileResume;
