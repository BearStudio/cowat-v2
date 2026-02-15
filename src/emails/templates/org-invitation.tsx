import {
  Button,
  Container,
  Heading,
  Section,
  Text,
} from '@react-email/components';

import i18n from '@/lib/i18n';

import { EmailFooter } from '@/emails/components/email-footer';
import { EmailLayout } from '@/emails/components/email-layout';
import { styles } from '@/emails/styles';

export const TemplateOrgInvitation = (props: {
  language: string;
  organizationName: string;
  inviterName: string;
  acceptUrl: string;
}) => {
  i18n.changeLanguage(props.language);

  return (
    <EmailLayout
      preview={i18n.t('emails:orgInvitation.preview', {
        organizationName: props.organizationName,
      })}
      language={props.language}
    >
      <Container style={styles.container}>
        <Heading style={styles.h1}>
          {i18n.t('emails:orgInvitation.title')}
        </Heading>
        <Section style={styles.section}>
          <Text style={styles.text}>
            {i18n.t('emails:orgInvitation.intro', {
              inviterName: props.inviterName,
              organizationName: props.organizationName,
            })}
          </Text>
          <Button style={styles.button} href={props.acceptUrl}>
            {i18n.t('emails:orgInvitation.acceptButton')}
          </Button>
          <Text style={styles.textMuted}>
            {i18n.t('emails:orgInvitation.ignoreHelper')}
          </Text>
        </Section>
        <EmailFooter />
      </Container>
    </EmailLayout>
  );
};

export default TemplateOrgInvitation;
