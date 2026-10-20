
import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { t } from "../lib/i18n";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />

      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#2563eb",
          },
          headerTintColor: "#ffffff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          contentStyle: {
            backgroundColor: "#f3f6fb",
          },
        }}
      >
        {/* Trang 1: Danh sách sinh viên */}
        <Stack.Screen
          name="index"
          options={{
            title: t("appName"),
            headerShown: false,
          }}
        />

        {/* Trang 2: Chi tiết sinh viên */}
        <Stack.Screen
          name="detail"
          options={{
            title: t("studentDetail"),
          }}
        />

        {/* Trang 3: Thêm / Sửa sinh viên */}
        <Stack.Screen
          name="form"
          options={{
            title: t("addStudent"),
          }}
        />
      </Stack>
    </>
  );
}
