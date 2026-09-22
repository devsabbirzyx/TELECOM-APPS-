import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { rounded, spacing } from '../../theme/spacing';
import { Header } from '../../components/Header';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type ChatRouteProp = RouteProp<RootStackParamList, 'LiveChat'>;
type ChatNavProp = StackNavigationProp<RootStackParamList, 'LiveChat'>;

interface Props {
  route: ChatRouteProp;
  navigation: ChatNavProp;
}

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  time: string;
}

export const LiveChatScreen: React.FC<Props> = ({ navigation }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'agent',
      text: 'Hello Tanvir! Welcome to Mobixa Support. How can I help you today?',
      time: '10:00 AM',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Simulate agent response
    setTimeout(() => {
      const agentReply: Message = {
        id: `m-${Date.now() + 1}`,
        sender: 'agent',
        text: 'Thank you for your message! Our representative is looking into this and will verify the details right away.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, agentReply]);
    }, 1200);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Header
        title="Live Support Chat"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <View style={styles.agentStatus}>
            <View style={styles.onlineDot} />
            <Text style={[typography.labelSm, styles.onlineText]}>Online</Text>
          </View>
        }
      />

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.messageScroll}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <View
              key={msg.id}
              style={[
                styles.bubbleWrapper,
                isUser ? styles.userBubbleWrapper : styles.agentBubbleWrapper,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  isUser ? styles.userBubble : styles.agentBubble,
                ]}
              >
                <Text
                  style={[
                    typography.bodyMd,
                    isUser ? styles.userText : styles.agentText,
                  ]}
                >
                  {msg.text}
                </Text>
                <Text
                  style={[
                    typography.labelSm,
                    isUser ? styles.userTime : styles.agentTime,
                  ]}
                >
                  {msg.time}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          placeholder="Type your message..."
          placeholderTextColor={colors.outline}
          value={inputText}
          onChangeText={setInputText}
          style={[typography.bodyMd, styles.textInput]}
          multiline
        />
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSend}
          style={[
            styles.sendBtn,
            inputText.trim() ? styles.sendBtnActive : undefined,
          ]}
        >
          <Ionicons
            name="send"
            size={18}
            color={inputText.trim() ? '#ffffff' : colors.outline}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  agentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: rounded.full,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.tertiaryContainer,
  },
  onlineText: {
    color: colors.tertiaryContainer,
    fontWeight: '700',
  },
  messageScroll: {
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
  },
  bubbleWrapper: {
    marginBottom: spacing.md,
    flexDirection: 'row',
  },
  userBubbleWrapper: {
    justifyContent: 'flex-end',
  },
  agentBubbleWrapper: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: rounded.lg,
  },
  userBubble: {
    backgroundColor: colors.primaryContainer,
    borderBottomRightRadius: 2,
  },
  agentBubble: {
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userText: {
    color: '#ffffff',
  },
  agentText: {
    color: colors.onSurface,
  },
  userTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
    marginTop: 4,
    fontSize: 10,
  },
  agentTime: {
    color: colors.outline,
    marginTop: 4,
    fontSize: 10,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: rounded.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    maxHeight: 100,
    color: colors.onSurface,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: {
    backgroundColor: colors.primaryContainer,
  },
});
