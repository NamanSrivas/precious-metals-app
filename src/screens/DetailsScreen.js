import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { fetchMetalPrice } from '../api/metalsAPI';
import LoadingSpinner from '../components/LoadingSpinner';

const DetailsScreen = ({ route }) => {
  // metalParam is the object; initialData holds its first snapshot
  const { data: initialData, metal: metalParam } = route.params;
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  const scrollViewRef = useRef(null);
  const intervalRef = useRef(null);

  const updateData = async () => {
    try {
      const newData = await fetchMetalPrice(metalParam.code);
      setData(newData);
      setLastUpdated(new Date());
    } catch (error) {
      console.log('Auto-update failed:', error);
    }
  };

  useEffect(() => {
    intervalRef.current = setInterval(updateData, 3000);
    return () => clearInterval(intervalRef.current);
  }, [metalParam.code]);

  const refreshData = async () => {
    setLoading(true);
    try {
      const newData = await fetchMetalPrice(metalParam.code);
      setData(newData);
      setLastUpdated(new Date());
    } catch {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const getChangeColor = (change) => {
    if (change > 0) return '#4CAF50';
    if (change < 0) return '#F44336';
    return '#757575';
  };

  const formatPrice = (price) => price != null ? `$${price.toFixed(2)}` : 'N/A';
  const formatChange = (chg) => chg != null ? `${chg > 0 ? '+' : ''}${chg.toFixed(2)}` : 'N/A';
  const formatPercentage = (pct) => pct != null ? `${pct > 0 ? '+' : ''}${pct.toFixed(2)}%` : 'N/A';

  const formatDateTime = (date) => date.toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const getTimeSinceUpdate = () => {
    const s = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
    if (s < 5) return 'Just now';
    if (s < 60) return `${s}s ago`;
    return `${Math.floor(s/60)}m ago`;
  };

  const DetailRow = ({ label, value, color = '#fff' }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, { color }]}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      <View style={styles.liveHeader}>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE • Updates every 3s</Text>
        </View>
        <Text style={styles.lastUpdateText}>Updated {getTimeSinceUpdate()}</Text>
      </View>
      
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        maintainVisibleContentPosition={{ minIndexForVisible: 0, autoscrollToTopThreshold: 100 }}
      >
        <View style={styles.headerCard}>
          <Text style={styles.metalName}>{data?.name || metalParam.name}</Text>
          <Text style={styles.currentPrice}>{formatPrice(data?.price)}</Text>
          <View style={styles.changeContainer}>
            <Text style={[styles.change, { color: getChangeColor(data?.change) }]}>
              {formatChange(data?.change)} ({formatPercentage(data?.changePercent)})
            </Text>
          </View>
          <Text style={styles.unit}>{data?.unit}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Todays Trading</Text>
          <DetailRow label="Open" value={formatPrice(data?.open)} />
          <DetailRow label="High" value={formatPrice(data?.high)} color="#4CAF50" />
          <DetailRow label="Low" value={formatPrice(data?.low)} color="#F44336" />
          <DetailRow label="Previous Close" value={formatPrice(data?.previousClose)} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚡ 24 Karat Price</Text>
          <DetailRow label="Current (24K)" value={formatPrice(data?.price)} color="#FFD700" />
          <DetailRow label="Per Gram" value={formatPrice(data?.price / 31.1035)} />
          <DetailRow label="Per 10 Gram" value={formatPrice((data?.price / 31.1035) * 10)} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🕒 Time Information</Text>
          <DetailRow label="Today's Date" value={new Date().toLocaleDateString()} />
          <DetailRow label="Current Time" value={new Date().toLocaleTimeString()} />
          <DetailRow label="Last Updated" value={formatDateTime(lastUpdated)} />
          <DetailRow label="Market Status" value="Live Streaming" color="#4CAF50" />
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={refreshData}>
          <Text style={styles.refreshButtonText}>🔄 Manual Refresh</Text>
        </TouchableOpacity>
      </ScrollView>

      <LoadingSpinner visible={loading} text="Refreshing prices..." />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  liveHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 12, backgroundColor: '#2a2a2a'
  },
  liveIndicator: { flexDirection: 'row', alignItems: 'center' },
  liveDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#4CAF50', marginRight: 8
  },
  liveText: { color: '#4CAF50', fontSize: 12, fontWeight: 'bold' },
  lastUpdateText: { color: '#999', fontSize: 11 },
  scrollView: { flex: 1 },
  headerCard: {
    backgroundColor: '#2a2a2a', margin: 16, padding: 24,
    borderRadius: 16, alignItems: 'center'
  },
  metalName: { fontSize: 28, fontWeight: 'bold', color: '#FFD700' },
  currentPrice: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginVertical: 8 },
  changeContainer: { marginBottom: 8 },
  change: { fontSize: 18, fontWeight: '600' },
  unit: { fontSize: 14, color: '#999' },
  card: {
    backgroundColor: '#2a2a2a', marginHorizontal: 16, marginTop: 8, padding: 20,
    borderRadius: 12
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFD700', marginBottom: 16 },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#3a3a3a'
  },
  detailLabel: { fontSize: 16, color: '#999' },
  detailValue: { fontSize: 16, fontWeight: '600' },
  refreshButton: {
    backgroundColor: '#FFD700', margin: 16, padding: 16, borderRadius: 12,
    alignItems: 'center'
  },
  refreshButtonText: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' },
});

export default DetailsScreen;
