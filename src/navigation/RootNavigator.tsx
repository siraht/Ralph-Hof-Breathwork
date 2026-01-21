import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';

import { HomeScreen } from '../app/HomeScreen';
import { HistoryScreen } from '../app/HistoryScreen';
import { SettingsScreen } from '../app/SettingsScreen';
import { SafetyScreen } from '../app/SafetyScreen';
import { BreathSessionScreen } from '../app/BreathSessionScreen';
import { SessionSummaryScreen } from '../app/SessionSummaryScreen';
import { ColdExposureScreen } from '../app/ColdExposureScreen';
import { colors } from '../theme';
import type { HomeStackParamList, RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Safety" component={SafetyScreen} />
      <HomeStack.Screen name="BreathSession" component={BreathSessionScreen} />
      <HomeStack.Screen name="SessionSummary" component={SessionSummaryScreen} />
      <HomeStack.Screen name="ColdExposure" component={ColdExposureScreen} />
    </HomeStack.Navigator>
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
          backgroundColor: colors.sand,
          borderTopColor: colors.stroke,
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
              : route.name === 'History'
                ? 'clock'
                : 'sliders';
          return <Feather name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ title: 'Home' }}
      />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
