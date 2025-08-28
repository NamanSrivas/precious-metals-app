import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const MetalTile = ({ metal, data, loading, error, onPress, lastUpdated }) => {
  const [pulseAnim] = useState(new Animated.Value(1));
  const [priceChangeAnim] = useState(new Animated.Value(1));
  const [prevPrice, setPrevPrice] = useState(data?.price);
  
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [loading, pulseAnim]);

  // Price change animation
  useEffect(() => {
    if (data?.price && prevPrice && data.price !== prevPrice) {
      Animated.sequence([
        Animated.timing(priceChangeAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(priceChangeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      setPrevPrice(data.price);
    }
  }, [data?.price, prevPrice, priceChangeAnim]);

  const getChangeColor = (change) => {
    if (change > 0) return '#00ff88';
    if (change < 0) return '#ff3366';
    return '#64ffda';
  };

  const getMetalColor = (metalName) => {
    const colors = {
      'Gold': '#ffd700',
      'Silver': '#c0c0c0',
      'Platinum': '#e5e4e2',
      'Palladium': '#cdd2dd'
    };
    return colors[metalName] || '#ffd700';
  };

  const formatPrice = (price) => {
    return price ? `$${price.toFixed(2)}` : 'N/A';
  };

  const formatChange = (change) => {
    if (!change) return 'N/A';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}`;
  };

  const formatPercentage = (percent) => {
    if (!percent) return 'N/A';
    const sign = percent > 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTimeSinceUpdate = () => {
    if (!lastUpdated) return 'Never';
    const seconds = Math.floor((Date.now() - lastUpdated) / 1000);
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <TouchableOpacity 
        style={[
          styles.container,
          { borderColor: getMetalColor(data?.name || metal) }
        ]} 
        onPress={() => onPress && onPress(metal, data)}
        disabled={Boolean(loading) || Boolean(error)}
        activeOpacity={0.8}
      >
        <View style={[styles.glowBorder, { shadowColor: getMetalColor(data?.name || metal) }]} />
        
        <View style={styles.header}>
          <Text style={[styles.metalName, { color: getMetalColor(data?.name || metal) }]}>
            {data?.name || metal}
          </Text>
          <View style={styles.timeContainer}>
            <Text style={styles.timestamp}>{getCurrentTime()}</Text>
            <View style={[styles.statusDot, { backgroundColor: loading ? '#ff9800' : '#00ff88' }]} />
          </View>
        </View>
        
        {/* Live Update Indicator */}
        <View style={styles.updateIndicator}>
          <Text style={styles.updateText}>LIVE • {getTimeSinceUpdate()}</Text>
        </View>
        
        {Boolean(loading) && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingRing}>
              <ActivityIndicator size="large" color={getMetalColor(data?.name || metal)} />
            </View>
            <Text style={styles.loadingText}>SYNC {(data?.name || metal).toUpperCase()}</Text>
            <Text style={styles.loadingSubText}>Real-time data...</Text>
          </View>
        )}

        {Boolean(error) && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>❌ SYNC ERROR</Text>
            <Text style={styles.errorSubText}>Tap to retry</Text>
          </View>
        )}

        {!Boolean(loading) && !Boolean(error) && data && (
          <View style={styles.content}>
            <Animated.View style={[styles.priceRow, { transform: [{ scale: priceChangeAnim }] }]}>
              <Text style={styles.currentPrice}>{formatPrice(data.price)}</Text>
              <View style={styles.changeContainer}>
                <Text style={[styles.change, { color: getChangeColor(data.change) }]}>
                  {formatChange(data.change)}
                </Text>
                <Text style={[styles.percentage, { color: getChangeColor(data.change) }]}>
                  ({formatPercentage(data.changePercent)})
                </Text>
              </View>
            </Animated.View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>24K</Text>
                <Text style={[styles.statValue, { color: getMetalColor(data?.name || metal) }]}>
                  {formatPrice(data.price)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>HIGH</Text>
                <Text style={styles.statValue}>${data.high ? data.high.toFixed(2) : 'N/A'}</Text>
              </View>
            </View>
            
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min(Math.abs(data.changePercent || 0) * 20, 100)}%`,
                    backgroundColor: getChangeColor(data.change || 0)
                  }
                ]} 
              />
            </View>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(10, 25, 40, 0.9)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ffd700',
    padding: 16,
    margin: 8,
    minHeight: 200,
    width: (width - 60) / 2,
    shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  glowBorder: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: 16,
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metalName: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 10,
    color: '#64ffda',
    fontWeight: 'bold',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 3,
  },
  updateIndicator: {
    marginBottom: 8,
  },
  updateText: {
    fontSize: 9,
    color: '#00ff88',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingRing: {
    marginBottom: 12,
  },
  loadingText: {
    color: '#ffd700',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  loadingSubText: {
    color: '#64ffda',
    fontSize: 10,
    marginTop: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ff3366',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorSubText: {
    color: '#64ffda',
    fontSize: 10,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  priceRow: {
    marginBottom: 12,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  changeContainer: {
    marginTop: 4,
  },
  change: {
    fontSize: 14,
    fontWeight: '700',
  },
  percentage: {
    fontSize: 11,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#64ffda',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(100, 255, 218, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});

export default MetalTile;
