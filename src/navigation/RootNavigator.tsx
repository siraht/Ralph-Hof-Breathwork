import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';

import { HomeScreen } from '../app/HomeScreen';
import { HistoryScreen } from '../app/HistoryScreen';
import { ResultsScreen } from '../app/ResultsScreen';
import { SettingsScreen } from '../app/SettingsScreen';
import { SafetyScreen } from '../app/SafetyScreen';
import { BreathSessionScreen } from '../app/BreathSessionScreen';
import { SessionSummaryScreen } from '../app/SessionSummaryScreen';
import { ColdExposureScreen } from '../app/ColdExposureScreen';
import { SessionDetailScreen } from '../app/SessionDetailScreen';
import { GuidedBreathingScreen } from '../app/GuidedBreathingScreen';
import { colors } from '../theme';
import type { HistoryStackParamList, HomeStackParamList, RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const HistoryStack = createNativeStackNavigator<HistoryStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Safety" component={SafetyScreen} />
      <HomeStack.Screen name="GuidedBreathing" component={GuidedBreathingScreen} />
      <HomeStack.Screen name="BreathSession" component={BreathSessionScreen} />
      <HomeStack.Screen name="SessionSummary" component={SessionSummaryScreen} />
      <HomeStack.Screen name="ColdExposure" component={ColdExposureScreen} />
    </HomeStack.Navigator>
  );
}

function HistoryStackNavigator() {
  return (
    <HistoryStack.Navigator screenOptions={{ headerShown: false }}>
      <HistoryStack.Screen name="ResultsTab" component={ResultsScreen} />
      <HistoryStack.Screen name="SessionDetail" component={SessionDetailScreen} />
    </HistoryStack.Navigator>
  );
}

export function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.deep,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.frost,
          borderTopColor: colors.border,
          height: 68,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: 'SpaceGrotesk_500Medium',
          fontSize: 12,
        },
        tabBarIcon: ({ color, size }) => {
          const iconName =
            route.name === 'HomeTab'
              ? 'home'
              : route.name === 'ResultsTab'
                ? 'bar-chart-2'
                : 'settings';
          return <Feather name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="ResultsTab"
        component={HistoryStackNavigator}
        options={{ title: 'Results' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}
