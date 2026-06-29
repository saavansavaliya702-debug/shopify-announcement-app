import { useCallback, useEffect, useState } from "react";
import {
  Page,
  Card,git add src/config.js src/pages/AnnouncementPage.jsx
  TextField,
  Button,
  BlockStack,
  Banner,
  Text,
  Badge,
  InlineStack,
} from "@shopify/polaris";
import { API_BASE_URL } from "../config";

export default function AnnouncementPage() {
  const [text, setText] = useState("");
  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null); // { tone, message }

  const loadCurrent = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/announcement/current`);
      const data = await res.json();
      if (data.current?.text) setText(data.current.text);
    } catch (err) {
      console.error("Failed to load current announcement", err);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/announcement/history`);
      const data = await res.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error("Failed to load history", err);
    }
  }, []);

  useEffect(() => {
    loadCurrent();
    loadHistory();
  }, [loadCurrent, loadHistory]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/announcement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();

      if (res.status === 201) {
        setFeedback({
          tone: "success",
          message: "Saved and synced to Shopify.",
        });
      } else if (res.status === 207) {
        setFeedback({
          tone: "warning",
          message: data.warning || "Saved but sync failed.",
        });
      } else {
        setFeedback({
          tone: "critical",
          message: data.error || "Failed to save.",
        });
      }

      loadHistory();
    } catch (err) {
      setFeedback({ tone: "critical", message: "Network error while saving." });
    } finally {
      setSaving(false);
    }
  }, [text, loadHistory]);

  return (
    <Page title='Storefront Announcement'>
      <BlockStack gap='400'>
        {feedback && (
          <Banner tone={feedback.tone} onDismiss={() => setFeedback(null)}>
            {feedback.message}
          </Banner>
        )}

        <Card>
          <BlockStack gap='400'>
            <TextField
              label='Announcement Text'
              value={text}
              onChange={setText}
              autoComplete='off'
              placeholder='e.g. Sale 50% Off this weekend!'
              helpText='This text is saved to your database and synced to a Shopify shop metafield, which the storefront banner reads from.'
            />
            <Button variant='primary' loading={saving} onClick={handleSave}>
              Save
            </Button>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap='300'>
            <Text as='h2' variant='headingMd'>
              History
            </Text>
            {history.length === 0 && (
              <Text tone='subdued'>No announcements saved yet.</Text>
            )}
            {history.map((item) => (
              <InlineStack key={item._id} align='space-between'>
                <Text as='span'>{item.text}</Text>
                <InlineStack gap='200'>
                  <Badge tone={item.syncedToShopify ? "success" : "attention"}>
                    {item.syncedToShopify ? "Synced" : "Not synced"}
                  </Badge>
                  <Text as='span' tone='subdued'>
                    {new Date(item.createdAt).toLocaleString()}
                  </Text>
                </InlineStack>
              </InlineStack>
            ))}
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
