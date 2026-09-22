import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { rounded, spacing } from '../../theme/spacing';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type SupportNavProp = StackNavigationProp<RootStackParamList, 'HelpSupport'>;

interface Props {
  navigation: SupportNavProp;
}

const FAQS = [
  {
    q: 'How fast does the recharge activate on my SIM?',
    a: 'All operator packages activate almost instantly (within 10 to 60 seconds) through direct telecom carrier gateway integration.',
  },
  {
    q: 'What happens if my payment succeeds but SIM is not recharged?',
    a: 'If any operator gateway experiences downtime, our system automatically re-attempts the recharge or immediately refunds 100% of the amount to your Mobixa wallet.',
  },
  {
    q: 'Can I recharge for family or friends?',
    a: 'Yes! You can enter any valid Bangladeshi mobile number during checkout or pick from your Saved Numbers list.',
  },
  {
    q: 'How does Wallet Cashback work?',
    a: 'Cashback from purchases and drive offers is credited immediately into your Mobixa wallet and can be used on any future recharge.',
  },
];

export const HelpSupportScreen: React.FC<Props> = ({ navigation }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const handleCall = () => {
    Linking.openURL('tel:16247').catch(() => Alert.alert('Support Line', 'Dial 16247 for 24/7 Helpline'));
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/8801712345678').catch(() => Alert.alert('WhatsApp', 'WhatsApp +8801712345678'));
  };

  return (
    <View style={styles.container}>
      <Header title="Help & Support" showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Quick Contact Cards */}
        <View style={styles.contactRow}>
          <TouchableOpacity
            style={styles.contactCard}
            onPress={() => navigation.navigate('LiveChat', {})}
            activeOpacity={0.8}
          >
            <View style={[styles.iconBox, { backgroundColor: '#eff4ff' }]}>
              <Ionicons name="chatbubbles" size={24} color={colors.primaryContainer} />
            </View>
            <Text style={[typography.titleMd, styles.contactTitle]}>Live Chat</Text>
            <Text style={[typography.bodySm, styles.contactSubtitle]}>Instant Support</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={handleWhatsApp} activeOpacity={0.8}>
            <View style={[styles.iconBox, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="logo-whatsapp" size={24} color={colors.tertiaryContainer} />
            </View>
            <Text style={[typography.titleMd, styles.contactTitle]}>WhatsApp</Text>
            <Text style={[typography.bodySm, styles.contactSubtitle]}>Chat on WA</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={handleCall} activeOpacity={0.8}>
            <View style={[styles.iconBox, { backgroundColor: '#ffedd5' }]}>
              <Ionicons name="call" size={24} color={colors.secondaryContainer} />
            </View>
            <Text style={[typography.titleMd, styles.contactTitle]}>Call 16247</Text>
            <Text style={[typography.bodySm, styles.contactSubtitle]}>24/7 Helpline</Text>
          </TouchableOpacity>
        </View>

        {/* FAQs Section */}
        <Text style={[typography.headlineSm, styles.sectionTitle]}>
          Frequently Asked Questions
        </Text>

        <View style={styles.faqList}>
          {FAQS.map((faq, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                onPress={() => setExpandedIndex(isExpanded ? null : index)}
                style={styles.faqItem}
              >
                <View style={styles.faqQuestionRow}>
                  <Text style={[typography.titleMd, styles.questionText]}>{faq.q}</Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.primaryContainer}
                  />
                </View>
                {isExpanded && (
                  <Text style={[typography.bodyMd, styles.answerText]}>{faq.a}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Still need help CTA */}
        <View style={styles.helpBanner}>
          <Text style={[typography.titleMd, styles.helpBannerTitle]}>
            Can't find what you need?
          </Text>
          <Text style={[typography.bodyMd, styles.helpBannerSub]}>
            Our friendly customer support agents are ready to assist you 24/7.
          </Text>
          <Button
            title="Start Live Support Chat"
            onPress={() => navigation.navigate('LiveChat', {})}
            variant="primary"
            size="md"
            icon={<Ionicons name="chatbubble-ellipses-outline" size={18} color="#ffffff" />}
            style={styles.chatBtn}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  contactRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  contactCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  contactTitle: {
    color: colors.onSurface,
  },
  contactSubtitle: {
    color: colors.outline,
    marginTop: 2,
  },
  sectionTitle: {
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  faqList: {
    marginBottom: spacing.xl,
  },
  faqItem: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.lg,
    padding: spacing.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  faqQuestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionText: {
    color: colors.onSurface,
    flex: 1,
    paddingRight: spacing.sm,
  },
  answerText: {
    color: colors.onSurfaceVariant,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  helpBanner: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: rounded.xl,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  helpBannerTitle: {
    color: colors.primaryContainer,
    marginBottom: spacing.xs,
  },
  helpBannerSub: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  chatBtn: {
    width: '100%',
  },
});
