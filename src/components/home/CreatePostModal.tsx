import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableWithoutFeedback,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../../theme/AppThemeContext';

const DEEP = '#1E1B4B';
const ACCENT = '#5B6AF0';
const BG = '#E8EAF6';
const TEXT_DARK = '#1A1A2E';
const TEXT_MUTED = '#8892A6';
const { width: SW, height: SH } = Dimensions.get('window');

const CATEGORIES = [
    { id: 'cs', name: 'Computer Science', icon: 'code-slash', color: '#3B82F6' },
    { id: 'physics', name: 'Physics', icon: 'planet', color: '#8B5CF6' },
    { id: 'chemistry', name: 'Chemistry', icon: 'flask', color: '#22C55E' },
    { id: 'math', name: 'Mathematics', icon: 'calculator', color: '#F59E0B' },
    { id: 'bio', name: 'Biology', icon: 'leaf', color: '#10B981' },
    { id: 'general', name: 'General', icon: 'chatbubbles', color: '#6366F1' },
];

interface CreatePostModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (post: { title: string; content: string; category: string }) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
    visible,
    onClose,
    onSubmit,
}) => {
    const { theme, isDark } = useAppTheme();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [step, setStep] = useState(1);

    const resetForm = () => {
        setTitle('');
        setContent('');
        setSelectedCategory('');
        setStep(1);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = () => {
        if (title.trim() && content.trim() && selectedCategory) {
            onSubmit({
                title: title.trim(),
                content: content.trim(),
                category: selectedCategory,
            });
            resetForm();
            onClose();
        }
    };

    const canProceed = step === 1 ? selectedCategory !== '' : title.trim() !== '' && content.trim() !== '';

    return (
        <Modal
            transparent
            visible={visible}
            animationType="slide"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <TouchableWithoutFeedback onPress={handleClose}>
                    <View style={[styles.backdrop, { backgroundColor: theme.modalBackdrop }]} />
                </TouchableWithoutFeedback>

                <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: theme.border }]}>
                        <View style={[styles.handleBar, { backgroundColor: theme.border }]} />
                        <View style={styles.headerRow}>
                            <TouchableOpacity
                                onPress={step === 1 ? handleClose : () => setStep(1)}
                                style={[styles.headerBtn, { backgroundColor: theme.surfaceSoft }]}
                            >
                                <Ionicons
                                    name={step === 1 ? 'close' : 'arrow-back'}
                                    size={24}
                                    color={theme.text}
                                />
                            </TouchableOpacity>
                            <Text style={[styles.headerTitle, { color: theme.text }]}>
                                {step === 1 ? 'Choose Topic' : 'Create Post'}
                            </Text>
                            <View style={[styles.headerBtn, { backgroundColor: 'transparent' }]} />
                        </View>
                        
                        {/* Progress indicator */}
                        <View style={styles.progressRow}>
                            <View style={[styles.progressDot, styles.progressDotActive]} />
                            <View style={[styles.progressLine, step === 2 && styles.progressLineActive]} />
                            <View style={[styles.progressDot, step === 2 && styles.progressDotActive]} />
                        </View>
                    </View>

                    <ScrollView
                        style={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {step === 1 ? (
                            /* Category Selection */
                            <View style={styles.categoryGrid}>
                                {CATEGORIES.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[
                                            styles.categoryCard,
                                            { backgroundColor: theme.surfaceSoft },
                                            selectedCategory === cat.name && styles.categoryCardSelected,
                                            selectedCategory === cat.name && {
                                                borderColor: theme.primary,
                                                backgroundColor: isDark ? '#1D2A3F' : '#F0F4FF',
                                            },
                                        ]}
                                        onPress={() => setSelectedCategory(cat.name)}
                                        activeOpacity={0.7}
                                    >
                                        <View
                                            style={[
                                                styles.categoryIconBg,
                                                { backgroundColor: `${cat.color}20` },
                                                selectedCategory === cat.name && { backgroundColor: `${cat.color}30` },
                                            ]}
                                        >
                                            <Ionicons name={cat.icon as any} size={28} color={cat.color} />
                                        </View>
                                        <Text
                                            style={[
                                                styles.categoryText,
                                                { color: theme.text },
                                                selectedCategory === cat.name && styles.categoryTextSelected,
                                                selectedCategory === cat.name && { color: theme.primary },
                                            ]}
                                        >
                                            {cat.name}
                                        </Text>
                                        {selectedCategory === cat.name && (
                                            <View style={styles.checkBadge}>
                                                <Ionicons name="checkmark" size={14} color="#FFF" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            /* Post Form */
                            <View style={styles.formContainer}>
                                <View style={[styles.selectedCategoryBadge, { backgroundColor: theme.surfaceSoft }]}>
                                    <Ionicons name="bookmark" size={14} color={theme.primary} />
                                    <Text style={[styles.selectedCategoryText, { color: theme.primary }]}>{selectedCategory}</Text>
                                </View>

                                <Text style={[styles.label, { color: theme.text }]}>Question Title</Text>
                                <TextInput
                                    style={[styles.titleInput, { backgroundColor: theme.surfaceSoft, borderColor: theme.border, color: theme.text }]}
                                    placeholder="What would you like to ask?"
                                    placeholderTextColor={theme.textMuted}
                                    value={title}
                                    onChangeText={setTitle}
                                    multiline
                                    maxLength={150}
                                />
                                <Text style={[styles.charCount, { color: theme.textMuted }]}>{title.length}/150</Text>

                                <Text style={[styles.label, { color: theme.text }]}>Description</Text>
                                <TextInput
                                    style={[styles.contentInput, { backgroundColor: theme.surfaceSoft, borderColor: theme.border, color: theme.text }]}
                                    placeholder="Provide more details about your question..."
                                    placeholderTextColor={theme.textMuted}
                                    value={content}
                                    onChangeText={setContent}
                                    multiline
                                    textAlignVertical="top"
                                    maxLength={1000}
                                />
                                <Text style={[styles.charCount, { color: theme.textMuted }]}>{content.length}/1000</Text>

                                <View style={[styles.tips, { backgroundColor: isDark ? '#2F2410' : '#FFFBEB' }]}>
                                    <Ionicons name="bulb" size={18} color="#F59E0B" />
                                    <Text style={[styles.tipsText, { color: isDark ? '#FCD34D' : '#92400E' }]}>
                                        Tip: Be specific and clear to get better answers!
                                    </Text>
                                </View>
                            </View>
                        )}
                    </ScrollView>

                    {/* Footer Button */}
                    <View style={[styles.footer, { borderTopColor: theme.border }]}>
                        <TouchableOpacity
                            style={[
                                styles.submitBtn,
                                { backgroundColor: theme.primary, shadowColor: theme.primary },
                                !canProceed && [styles.submitBtnDisabled, { backgroundColor: theme.border }],
                            ]}
                            onPress={step === 1 ? () => setStep(2) : handleSubmit}
                            disabled={!canProceed}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.submitBtnText}>
                                {step === 1 ? 'Continue' : 'Post Question'}
                            </Text>
                            <Ionicons
                                name={step === 1 ? 'arrow-forward' : 'send'}
                                size={18}
                                color="#FFF"
                                style={{ marginLeft: 8 }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 12, 40, 0.6)',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        maxHeight: SH * 0.85,
        minHeight: SH * 0.6,
    },
    header: {
        paddingTop: 12,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F2FA',
    },
    handleBar: {
        width: 40,
        height: 4,
        backgroundColor: '#E2E8F0',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    headerBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F2FA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: TEXT_DARK,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 16,
    },
    progressDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#E2E8F0',
    },
    progressDotActive: {
        backgroundColor: ACCENT,
    },
    progressLine: {
        width: 60,
        height: 3,
        backgroundColor: '#E2E8F0',
        marginHorizontal: 8,
        borderRadius: 2,
    },
    progressLineActive: {
        backgroundColor: ACCENT,
    },
    scrollContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    categoryCard: {
        width: (SW - 52) / 2,
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    categoryCardSelected: {
        backgroundColor: '#F0F4FF',
        borderColor: ACCENT,
    },
    categoryIconBg: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
        color: TEXT_DARK,
        textAlign: 'center',
    },
    categoryTextSelected: {
        color: ACCENT,
        fontWeight: '700',
    },
    checkBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: ACCENT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    formContainer: {
        paddingBottom: 20,
    },
    selectedCategoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F4FF',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 20,
    },
    selectedCategoryText: {
        fontSize: 13,
        fontWeight: '600',
        color: ACCENT,
        marginLeft: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: TEXT_DARK,
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    titleInput: {
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        fontWeight: '600',
        color: TEXT_DARK,
        minHeight: 60,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    contentInput: {
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 16,
        fontSize: 15,
        color: TEXT_DARK,
        minHeight: 150,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        lineHeight: 22,
    },
    charCount: {
        fontSize: 12,
        color: TEXT_MUTED,
        textAlign: 'right',
        marginTop: 6,
        marginBottom: 20,
    },
    tips: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        padding: 14,
        borderRadius: 14,
    },
    tipsText: {
        fontSize: 13,
        color: '#92400E',
        marginLeft: 10,
        flex: 1,
        fontWeight: '500',
    },
    footer: {
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        borderTopWidth: 1,
        borderTopColor: '#F0F2FA',
    },
    submitBtn: {
        backgroundColor: ACCENT,
        borderRadius: 16,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: ACCENT,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    submitBtnDisabled: {
        backgroundColor: '#CBD5E1',
        elevation: 0,
        shadowOpacity: 0,
    },
    submitBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
});

export default CreatePostModal;
