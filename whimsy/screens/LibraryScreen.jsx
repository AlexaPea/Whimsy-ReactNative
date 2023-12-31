import { ScrollView, StyleSheet, Text, View, ImageBackground, Image, TouchableOpacity } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import LibraryBookCard from '../components/libraryBookCard';
import BookmarkedBookCard from '../components/bookmarkedBookCard';
import * as Font from 'expo-font';
import { globalStyles } from '../utils/GlobalStyles';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getAllStoriesFromCollection } from '../services/firebaseDb';
import { getCurrentUser } from '../services/firebaseAuth';
import { getUserRoleFromDatabase } from '../services/firebaseDb';
import { getAllBookmarkedStories } from '../services/firebaseDb';
import TouchableWithSound from '../components/TouchableWithSound';

const LibraryScreen = () => {

  const [fontLoaded, setFontLoaded] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [stories, setStories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const [subHeadingText, setSubHeadingText] = useState('All Stories');
  const [userRole, setUserRole] = useState(null);
  const user = getCurrentUser();
  const userUid = user ? user.uid : null;
  const userId = userUid; 
  const [selectedTab, setSelectedTab] = useState('myStories');
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const userRole = await getUserRoleFromDatabase(userUid);
        // console.log("Role: " + userRole);
        setUserRole(userRole);
      } catch (error) {
        console.log("Error retrieving current user:", error);
      }
    };
  
    fetchUserRole();
  }, [userUid]);

  const loadFonts = async () => {
    await Font.loadAsync({
      'Hensa': require('../assets/fonts/Hensa.ttf'),
    });
    setFontLoaded(true);
  };

  useEffect(() => {
    loadFonts();
  }, [selectedGenre, refreshing]);

  useFocusEffect(
    useCallback(() => {
      if (selectedTab === 'myBookmarks') {
        getAllBookmarks();
      } else if (selectedTab === 'myStories') {
        getAllStories();
      }
      return () => {
        // Cleanup when not viewing the screen
      };
    }, [selectedTab, selectedGenre])
  );

  const getAllStories = async () => {
    setRefreshing(true);
    // console.log("Getting data");
    const allStories = await getAllStoriesFromCollection();
    setStories(allStories);
    setRefreshing(false);
  };

  const getAllBookmarks = async () => {
    setRefreshing(true);
    const bookmarkedStories = await getAllBookmarkedStories(userUid);
    setStories(bookmarkedStories);
    setRefreshing(false);
    return Promise.resolve();
  };

useEffect(() => {
  if (selectedTab === 'myBookmarks') {
    getAllBookmarks().then(() => {
      setIsLoaded(true);
    });
  } else if (selectedTab === 'myStories') {
    getAllStories().then(() => {
      setIsLoaded(true);
    });
  }
}, [selectedTab]);

  const handleButtonPress = (genre) => {
    setSelectedGenre(genre);
    setSubHeadingText(genre ? genre : 'All Stories');
  };

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    if (tab === 'myBookmarks') {
      getAllBookmarks();
    } else if (tab === 'myStories') {
      getAllStories();
    }
  };
  
  return (
    <ImageBackground
      source={require('../assets/bg/general.png')}
      style={styles.backgroundImage}
    >
      {fontLoaded && (
        <View>
          <Text style={styles.heading}>Library</Text>
          <Text style={styles.body}>Let’s find the perfect story for you.</Text>

          <View style={styles.buttonContainer}>
            <View style={styles.rowOne}>
              <TouchableOpacity
                style={[
                  styles.book,
                  styles.book1,
                  selectedGenre === 'Fantasy' && { backgroundColor: '#6B8DFF' }
                ]}
                onPress={() => handleButtonPress('Fantasy')}
              >
                <Text style={styles.bookText}>Fantasy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.book,
                  styles.book2,
                  selectedGenre === 'Sci-Fi' && { backgroundColor: '#6B8DFF' }
                ]}
                onPress={() => handleButtonPress('Sci-Fi')}
              >
                <Text style={styles.bookText}>Sci-Fi</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.rowTwo}>
              <TouchableOpacity
                style={[
                  styles.book,
                  styles.book3,
                  selectedGenre === 'Classic Twist' && { backgroundColor: '#6B8DFF' }
                ]}
                onPress={() => handleButtonPress('Classic Twist')}
              >
                <Text style={[styles.bookText, styles.bookTextVertical]}>Classic Twist</Text>
              </TouchableOpacity>

              <View style={styles.rowThree}>
                <TouchableOpacity
                  style={[
                    styles.book,
                    styles.book4,
                    selectedGenre === '' && { backgroundColor: '#6B8DFF' }
                  ]}
                  onPress={() => handleButtonPress('')}
                >
                  <Text style={styles.bookText}>All Stories</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.book,
                    styles.book5,
                    selectedGenre === 'Romance' && { backgroundColor: '#6B8DFF' }
                  ]}
                  onPress={() => handleButtonPress('Romance')}
                >
                  <Text style={styles.bookText}>Romance</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.tabContainer}>
            <Text style={[styles.tabText, selectedTab === 'myStories' ? { opacity: 1 } : { opacity: 0.4 }]} onPress={() => setSelectedTab('myStories')}>All Stories</Text>
            <Text style={[styles.tabText, selectedTab === 'myBookmarks' ? { opacity: 1 } : { opacity: 0.4 }]} onPress={() => setSelectedTab('myBookmarks')}>My Bookmarks</Text>
          </View>
          {/* <Text style={styles.subHeading}>{subHeadingText}</Text> */}
          <ScrollView style={styles.scrollView}>
          {isLoaded && stories
            .filter(story => !selectedGenre || story.genre === selectedGenre)
            .map((story, index) => {
              const isCreator = story.userId === userId;
              let destinationScreen = '';
              let CardComponent = LibraryBookCard; // Default card component

              if (selectedTab === 'myStories') {
                if (isCreator && userRole === 'judge') {
                  destinationScreen = 'JudgeStory';
                } else if (isCreator) {
                  destinationScreen = 'ReadOwnStory';
                } else {
                  destinationScreen = 'ReadStory';
                }
              } else if (selectedTab === 'myBookmarks') {
                if (isCreator && userRole === 'judge') {
                  destinationScreen = 'JudgeBookmarkedStory';
                } else {
                  destinationScreen = 'ReadBookmarkedStory';
                  CardComponent = BookmarkedBookCard; // Use bookmarkedBookCard component
                }
              }

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => navigation.navigate(destinationScreen, { story })}
                >
                  <CardComponent data={story}/>
                </TouchableOpacity>
              );
            })}
    </ScrollView>
        </View>
      )}
    </ImageBackground>
  );
};

export default LibraryScreen;

const styles = StyleSheet.create({
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'cover',
  },
  heading: {
    fontFamily: 'Hensa',
    fontSize: 52,
    color: 'white',
    width: 350,
    paddingTop: 65,
    paddingLeft: 20,
    lineHeight: 50,
  },
  body: {
    color: 'white',
    width: 350,
    paddingLeft: 20,
    paddingTop: 5,
    paddingBottom: 40,
  },
  scrollView: {
    height: 240,
    position: 'absolute',
    marginTop: 510
  },
  subHeading: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
    paddingLeft: 20,
    position: 'absolute',
    marginTop: 470
  },
  buttonContainer: {
    flex: 1,
    gridColumnGap: 0,
    gridRowGap: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 400,
  },
  book: {
    flex: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  book1: {
    width: '55%',
    backgroundColor: '#B68C4C',
    height: 69,
  },
  book2: {
    width: '15%',
    height: 69,
    backgroundColor: '#9F3824',
  },
  book3: {
    height: 194,
    width: 33,
    backgroundColor: '#9F3824',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  book4: {
    height: 294,
    width: 243,
    backgroundColor: '#9F3824',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  book5: {
    height: 94,
    backgroundColor: '#B68C4C',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowOne: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    height: 69,
  },
  rowTwo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bookTextVertical: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    transform: [{ rotate: '-90deg' }],
  },
  bookText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 220,
    marginTop: 480
  },
  tabText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
    marginRight: 50
  }
});
