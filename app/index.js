import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

const METALS = [
  { code: 'XAU', name: 'Gold', base: 2015.75, color: '#ffd700' },
  { code: 'XAG', name: 'Silver', base: 23.45, color: '#c0c0c0' },
  { code: 'XPT', name: 'Platinum', base: 925.30, color: '#e5e4e2' },
  { code: 'XPD', name: 'Palladium', base: 1245.60, color: '#cdd2dd' },
];

export default function Index() {
  const [updateCount, setUpdateCount] = useState(0);
  const [selectedMetal, setSelectedMetal] = useState(null);

  // AUTO-UPDATE EVERY 3 SECONDS
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log(`🔄 INDEX UPDATE ${updateCount + 1} - ${new Date().toLocaleTimeString()}`);
      setUpdateCount(prev => prev + 1);
    }, 3000);

    return () => clearTimeout(timer);
  }, [updateCount]);

  const getLivePrice = (metal) => {
    const fluctuation = (Math.sin(updateCount + metal.code.charCodeAt(0)) * 0.02);
    const price = metal.base * (1 + fluctuation);
    const change = price - metal.base;
    return {
      code: metal.code,
      name: metal.name,
      color: metal.color,
      base: metal.base,
      price: price,
      change: change,
      changePercent: (change / metal.base) * 100,
    };
  };

  const MetalTile = ({ metal }) => {
    const liveData = getLivePrice(metal);
    
    return (
      <TouchableOpacity 
        style={[styles.tile, { borderColor: liveData.color }]}
        onPress={() => setSelectedMetal(liveData)}
      >
        <Text style={[styles.metalName, { color: liveData.color }]}>
          {liveData.name}
        </Text>
        <Text style={styles.updateText}>
          LIVE • Update #{updateCount}
        </Text>
        <Text style={styles.tileTime}>
          {new Date().toLocaleTimeString()}
        </Text>
        <Text style={styles.price}>
          ${liveData.price.toFixed(2)}
        </Text>
        <Text style={[styles.change, { color: liveData.change > 0 ? '#00ff88' : '#ff3366' }]}>
          {liveData.change > 0 ? '+' : ''}{liveData.change.toFixed(2)} ({liveData.changePercent.toFixed(2)}%)
        </Text>
      </TouchableOpacity>
    );
  };

  // DETAILS SCREEN
  if (selectedMetal) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={() => setSelectedMetal(null)}>
            <Text style={styles.backButton}>⬅ BACK</Text>
          </TouchableOpacity>
          <Text style={styles.detailTitle}>{selectedMetal.name} DETAILS</Text>
        </View>
        
        <View style={styles.detailCard}>
          <Text style={[styles.detailMetalName, { color: selectedMetal.color }]}>
            {selectedMetal.name}
          </Text>
          <Text style={styles.detailPrice}>
            ${selectedMetal.price.toFixed(2)}
          </Text>
          <Text style={[styles.detailChange, { color: selectedMetal.change > 0 ? '#00ff88' : '#ff3366' }]}>
            {selectedMetal.change > 0 ? '+' : ''}{selectedMetal.change.toFixed(2)} 
            ({selectedMetal.changePercent > 0 ? '+' : ''}{selectedMetal.changePercent.toFixed(2)}%)
          </Text>
          <Text style={styles.detailTime}>
            Updated: {new Date().toLocaleString()}
          </Text>
          <Text style={styles.detailUpdateCount}>
            Update #{updateCount}
          </Text>
        </View>
      </View>
    );
  }

  // HOME SCREEN
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LIVE METALS HUD</Text>
        <Text style={styles.subtitle}>
          Updates: {updateCount} • Every 3 seconds
        </Text>
        <Text style={styles.headerTime}>
          {new Date().toLocaleTimeString()}
        </Text>
      </View>

      <FlatList
        data={METALS}
        renderItem={({ item }) => <MetalTile metal={item} />}
        keyExtractor={item => item.code}
        numColumns={2}
        contentContainerStyle={styles.list}
        extraData={updateCount} // FORCE RE-RENDER
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000012',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 12,
    color: '#00ff88',
    marginTop: 5,
    fontWeight: 'bold',
  },
  headerTime: {
    fontSize: 10,
    color: '#64ffda',
    marginTop: 5,
  },
  list: {
    padding: 10,
  },
  tile: {
    backgroundColor: '#1a1a2e',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    margin: 8,
    width: (width - 60) / 2,
    minHeight: 150,
  },
  metalName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  updateText: {
    fontSize: 8,
    color: '#00ff88',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tileTime: {
    fontSize: 8,
    color: '#999',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
  },
  change: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  // DETAILS SCREEN STYLES
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1a1a2e',
  },
  backButton: {
    color: '#ffd700',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 20,
  },
  detailTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  detailCard: {
    backgroundColor: '#1a1a2e',
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  detailMetalName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailPrice: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
  },
  detailChange: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailTime: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  detailUpdateCount: {
    fontSize: 10,
    color: '#64ffda',
  },
});
