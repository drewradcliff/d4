import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{ title: "Inbox", headerShown: false }}
      />
      <Tabs.Screen
        name="tasks"
        options={{ title: "Tasks", headerShown: false }}
      />
    </Tabs>
  );
}
