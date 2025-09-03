import React, { useContext, useState } from 'react';
import { View, Image, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CredentialsContext } from '../../../context/CredentialsContext';
import StandardText from '../../../components/StandardText/StandardText';
import { menuItems } from './constant';

const DrawerContent = () => {
  const navigation = useNavigation();
  const { credentials, setCredentials } = useContext(CredentialsContext);
  const { firstName, email, phone } = credentials;

  const handleLogout = async () => {
    setCredentials(null);
    await AsyncStorage.clear();
  };

  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleExpand = label => {
    setExpandedMenus(prev => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const renderMenuItem = (item, index) => {
    const isExpanded = expandedMenus[item.label];
    const hasChildren = item.children?.length;

    return (
      <View key={index} style={{ marginVertical: 4 }}>
        <TouchableOpacity
          onPress={() =>
            hasChildren
              ? toggleExpand(item.label)
              : navigation.navigate('DrawerStack', {
                  screen: 'BottomNavigation',
                  params: { screen: item.route },
                })
          }
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 12,
            borderRadius: 10,
            backgroundColor: '#f8f8f8',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon
              name={item.icon}
              size={20}
              color="#333"
              style={{ marginRight: 12 }}
            />
            <StandardText fontWeight="semibold" style={{ fontSize: 15 }}>
              {item.label}
            </StandardText>
          </View>
          {hasChildren && (
            <Icon
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color="#888"
            />
          )}
        </TouchableOpacity>

        {hasChildren && isExpanded && (
          <View style={{ paddingLeft: 36, paddingTop: 4 }}>
            {item.children.map((subItem, subIndex) => (
              <TouchableOpacity
                key={subIndex}
                onPress={() =>
                  navigation.navigate('DrawerStack', {
                    screen: 'BottomNavigation',
                    params: { screen: subItem.route },
                  })
                }
                style={{
                  paddingVertical: 6,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Icon
                  name="ellipse-outline"
                  size={8}
                  color="#666"
                  style={{ marginRight: 10 }}
                />
                <StandardText style={{ fontSize: 14, color: '#666' }}>
                  {subItem.label}
                </StandardText>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      <SafeAreaView style={{ padding: 16, marginTop: 26 }}>
        <Image
          style={{ width: 220, height: 92, alignSelf: 'center' }}
          source={require('../../../assets/rentalinn.png')}
          resizeMode="contain"
        />
        <View style={{ marginTop: 16, alignItems: 'center' }}>
          <StandardText fontWeight="bold" style={{ fontSize: 18 }}>
            {firstName}
          </StandardText>
          <StandardText style={{ fontSize: 14, color: '#666' }}>
            {email}, +91 {phone}
          </StandardText>
        </View>

        <View
          style={{
            backgroundColor: '#e5f9ed',
            padding: 12,
            borderRadius: 12,
            marginTop: 16,
          }}
        >
          <StandardText fontWeight="bold" style={{ color: '#2f855a' }}>
            10 Rooms Active • 2 Requests
          </StandardText>
        </View>
      </SafeAreaView>

      <View style={{ padding: 16 }}>
        {menuItems.map((item, index) => renderMenuItem(item, index))}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            marginTop: 24,
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
          }}
        >
          <Icon name="log-out-outline" size={20} color="#e53e3e" />
          <StandardText
            fontWeight="regular"
            style={{ marginLeft: 12, fontSize: 16, color: '#e53e3e' }}
          >
            Logout
          </StandardText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default DrawerContent;
