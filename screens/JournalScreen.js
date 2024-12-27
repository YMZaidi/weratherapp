import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  FlatList, 
  TouchableOpacity,
  Modal,
  TextInput 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, onValue, remove } from 'firebase/database';
import { database, auth } from '../config/firebase';

export default function JournalScreen() {
  const [entries, setEntries] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [note, setNote] = useState('');

  // Load saved entries when component mounts
  useEffect(() => {
    const userId = auth.currentUser.uid;
    const journalRef = ref(database, `users/${userId}/journal`);
    
    // Listen for journal changes
    const unsubscribe = onValue(journalRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entriesArray = Object.values(data);
        setEntries(entriesArray.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } else {
        setEntries([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Save a new entry
  const saveEntry = async (photoUri, note) => {
    try {
      const newEntry = {
        id: Date.now().toString(),
        photoUri,
        note,
        date: new Date().toLocaleDateString(),
      };

      const updatedEntries = [...entries, newEntry];
      await AsyncStorage.setItem('weatherEntries', JSON.stringify(updatedEntries));
      setEntries(updatedEntries);
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  // Delete an entry
  const deleteEntry = async (id) => {
    try {
      const userId = auth.currentUser.uid;
      await remove(ref(database, `users/${userId}/journal/${id}`));
    } catch (error) {
      console.error('Error deleting entry:', error);
      Alert.alert('Error', 'Failed to delete journal entry');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.entryContainer}
      onPress={() => {
        setSelectedEntry(item);
        setModalVisible(true);
      }}
    >
      <Image source={{ uri: item.photoUri }} style={styles.thumbnail} />
      <View style={styles.entryInfo}>
        <Text style={styles.date}>{item.date}</Text>
        <Text style={styles.note} numberOfLines={2}>{item.note}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weather Journal</Text>
      
      <FlatList
        data={entries}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          {selectedEntry && (
            <>
              <Image 
                source={{ uri: selectedEntry.photoUri }} 
                style={styles.modalImage} 
              />
              <Text style={styles.modalDate}>{selectedEntry.date}</Text>
              <Text style={styles.modalNote}>{selectedEntry.note}</Text>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => {
                  deleteEntry(selectedEntry.id);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.deleteButtonText}>Delete Entry</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
  },
  list: {
    padding: 10,
  },
  entryContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 5,
  },
  entryInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  note: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  modalView: {
    flex: 1,
    backgroundColor: 'white',
    margin: 20,
    marginTop: 50,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  modalDate: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalNote: {
    fontSize: 16,
    marginBottom: 20,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#666',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
}); 