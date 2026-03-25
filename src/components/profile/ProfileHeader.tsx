import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

const ProfileHeader = () => {
    return (
        <View style={styles.headerContainer}>
            <View style={styles.headerContent}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.topBar}>
                        <Text style={styles.screenTitle}>Profile</Text>
                        <TouchableOpacity>
                            <Icon name="square-edit-outline" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.profileHeader}>
                        <Image
                            source={{ uri: 'https://i.pravatar.cc/300?img=12' }}
                            style={styles.avatar}
                        />
                        <View style={styles.profileTextContainer}>
                            <Text style={styles.userName}>Alex Rivera</Text>
                            <Text style={styles.userSubtitle}>Computer Science • 3rd Year</Text>
                        </View>
                    </View>

                    <Text style={styles.bioText}>
                        "Passionate developer focused on building scalable web solutions and fostering community growth through tech mentorship."
                    </Text>
                </SafeAreaView>
            </View>

            {/* Slanted Bottom Edge SVG */}
            <View style={styles.svgContainer}>
                <Svg height="50" width={width} viewBox={`0 0 ${width} 50`} style={styles.svg}>
                    <Path
                        d={`M0,0 L${width},0 L${width},40 L0,50 Z`}
                        fill="#152945"
                    />
                </Svg>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        marginBottom: 10,
    },
    headerContent: {
        backgroundColor: '#152945',
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 10,
    },
    screenTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    profileTextContainer: {
        marginLeft: 16,
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    userSubtitle: {
        fontSize: 14,
        color: '#94A3B8',
    },
    bioText: {
        fontSize: 14,
        color: '#CBD5E1',
        fontStyle: 'italic',
        lineHeight: 20,
        marginBottom: 10,
    },
    svgContainer: {
        marginTop: -1,
    },
    svg: {
        marginBottom: -1,
    }
});

export default ProfileHeader;
