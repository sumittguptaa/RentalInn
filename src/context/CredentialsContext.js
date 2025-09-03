import React, {createContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getOwnerDetails} from '../services/NetworkUtils';

export const CredentialsContext = createContext();

export const CredentialsProvider = ({children}) => {
  const [credentials, setCredentials] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkLoginCredentials = async () => {
    try {
      const data = await AsyncStorage.getItem('pgOwnerCredentials');
      if (data !== null) {
        const userDetails = await getOwnerDetails(JSON.parse(data));
        setCredentials(JSON.parse(data));
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const saveCredentials = async creds => {
    try {
      await AsyncStorage.setItem('pgOwnerCredentials', JSON.stringify(creds));
      setCredentials(creds);
    } catch (e) {}
  };

  const clearCredentials = async () => {
    try {
      await AsyncStorage.removeItem('pgOwnerCredentials');
      setCredentials(null);
    } catch (e) {}
  };

  useEffect(() => {
    checkLoginCredentials();
  }, []);

  return (
    <CredentialsContext.Provider
      value={{
        credentials,
        setCredentials: saveCredentials,
        clearCredentials,
        loading,
      }}>
      {children}
    </CredentialsContext.Provider>
  );
};
