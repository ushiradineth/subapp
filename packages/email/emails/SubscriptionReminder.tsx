import { Body, Button, Container, Head, Html, Img, Preview, Section, Text } from "@react-email/components";

interface EmailProps {
  product: {
    url?: string;
    name: string;
  };
  user: {
    name: string;
  };
  subscription: {
    paymentDueDate: string;
    paymentAmount: number;
  };
  period: "week" | "day";
}

const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";

export const SubscriptionReminder = ({ product, user, subscription, period }: EmailProps) => (
  <Html>
    <Head />
    <Preview>The subscription management platform that helps you track your subscriptions.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={`https://pwnatkddgcrwrcdpxdxu.supabase.co/storage/v1/object/public/assets/logo.png`} alt="SubM" style={logo} />
        <Text style={paragraph}>Hi {user.name},</Text>
        <Text style={paragraph}>We want to remind you that your Netflix subscription payment is due in just one {period}.</Text>
        <Text style={paragraph}>
          Payment Due Date: {subscription.paymentDueDate}
          <br />
          Amount Due: ${subscription.paymentAmount}
        </Text>
        {product.url && (
          <Section style={btnContainer}>
            <Button pX={12} pY={12} style={button} href={product.url}>
              Open {product.name}
            </Button>
          </Section>
        )}
        <Text style={paragraph}>
          Best,
          <br />
          The SubM Team
        </Text>
        {/* <Hr style={hr} />
        <Text style={footer}>
          To unsubscribe and stop receiving these emails, click{" "}
          <Link href={`${user.unsubscribeLink}`} style={link}>
            here
          </Link>{" "}
        </Text> */}
      </Container>
    </Body>
  </Html>
);

export default SubscriptionReminder;

const main = {
  backgroundColor: "#ffffff",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #eee",
  borderRadius: "5px",
  boxShadow: "0 5px 10px rgba(20,50,70,.2)",
  marginTop: "20px",
  width: "100%",
  margin: "0 auto",
  padding: "20px 60px 48px",
};

const logo = {
  margin: "20px auto 40px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
};

const btnContainer = {
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#5F51E8",
  borderRadius: "3px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
};

const hr = {
  borderColor: "#cccccc",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
};

const link = {
  color: "#444",
  textDecoration: "underline",
};
