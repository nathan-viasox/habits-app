import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Keyboard,
} from "react-native";

interface Props {
  onAdd: (title: string) => void;
}

export function AddHabitInput({ onAdd }: Props) {
  const [text, setText] = useState("");

  function submit() {
    if (!text.trim()) return;
    onAdd(text.trim());
    setText("");
    Keyboard.dismiss();
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Add a new habit…"
        placeholderTextColor="#AEAEB2"
        value={text}
        onChangeText={setText}
        onSubmitEditing={submit}
        returnKeyType="done"
      />
      <TouchableOpacity
        style={[styles.btn, !text.trim() && styles.btnDisabled]}
        onPress={submit}
        activeOpacity={0.8}
        disabled={!text.trim()}
      >
        <Text style={styles.btnText}>Add</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1C1C1E",
  },
  btn: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 10,
  },
  btnDisabled: {
    backgroundColor: "#C7C7CC",
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
