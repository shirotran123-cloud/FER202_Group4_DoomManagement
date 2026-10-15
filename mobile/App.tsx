import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { MOBILE_THEME } from "../theme";
import { saveToken } from "../auth-storage";

const SCREENS = ["Overview", "Booking", "Billing", "Maintenance", "Curfew", "Profile"] as const;

export default function App() {
  const [email, setEmail] = useState("");
  const [screen, setScreen] = useState<(typeof SCREENS)[number] | "Login">("Login");

  const login = async () => {
    await saveToken(`mobile-demo-${Date.now()}`);
    setScreen("Overview");
  };

  if (screen === "Login") {
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>Domanage KTX</Text>
        <Text style={styles.sub}>Đăng nhập + QR cổng + báo hỏng kèm ảnh</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="Email" style={styles.input} autoCapitalize="none" />
        <Button title="Đăng nhập demo" onPress={login} color={MOBILE_THEME.brand} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{screen}</Text>
      <Text style={styles.sub}>Theme đồng bộ web · token lưu SecureStore</Text>
      <View style={styles.grid}>
        {SCREENS.map((s) => (
          <View key={s} style={styles.cell}>
            <Button title={s} onPress={() => setScreen(s)} color={s === screen ? MOBILE_THEME.accent : MOBILE_THEME.brand} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, backgroundColor: MOBILE_THEME.bg, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "800", color: MOBILE_THEME.text },
  sub: { marginVertical: 8, color: MOBILE_THEME.muted },
  input: { backgroundColor: "#fff", borderRadius: 10, padding: 12, marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cell: { minWidth: "45%" },
});
