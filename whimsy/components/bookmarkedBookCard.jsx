import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { isStoryLiked } from '../services/firebaseDb';
import { getCurrentUser } from '../services/firebaseAuth';
import { getCurrentFeaturedStories } from '../services/firebaseDb';

const bookmarkedBookCard = ({data}) => {

  const user = getCurrentUser();
  const userUid = user.uid;
  // const { data } = props;
  const [isLiked, setIsLiked] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    fetchData();
  }, [data]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([checkIfLiked(), checkIfFeatured()]);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Handle the error
    } finally {
      setIsLoading(false);
    }
  };

  // console.log("Data:", JSON.stringify(data));
  // console.log("DataId:", data.storyId)
  
  ;
  const checkIfLiked = async () => {
    const userId = userUid;
    try {
      const liked = await isStoryLiked(userId, data.storyId);
      setIsLiked(liked);
    } catch (error) {
      console.error('Error checking if story is liked:', error);
      // Handle the error
    }
  };

  const checkIfFeatured = async () => {
    const featuredStories = await getCurrentFeaturedStories();
    const hasFeaturedStory = featuredStories.some((story) => story.creator === data.creator);
    setIsFeatured(hasFeaturedStory);
  };

  const getBookSymbol = (genre) => {
    switch (genre) {
      case 'Fantasy':
        return require('../assets/cards/symbols/fantasy.png');
      case 'Sci-Fi':
        return require('../assets/cards/symbols/sciFi.png');
      case 'Classic Twist':
        return require('../assets/cards/symbols/classicTwist.png');
      case 'Romance':
        return require('../assets/cards/symbols/romance.png');
    }
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.bookContainer}>
        <Image style={styles.book} source={require('../assets/cards/book.png')} />
        <View style={styles.contentContainer}>
          <View style={styles.bookSymbolCircle}>
            <Image style={styles.bookSymbol} source={getBookSymbol(data.genre)} />
          </View>
        </View>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{data.title}</Text>
        <View style={styles.authorContainer}>
          {isFeatured && (
            <Image style={styles.authorIcon} source={require('../assets/wizardHat.png')} />
          )}
          <Text style={[styles.author, isFeatured && styles.featuredAuthor]}>{data.creator}</Text>
        </View>
        <View style={styles.promptContainer}>
          <Text style={styles.prompt}>{data.prompt}</Text>
        </View>
      </View>
      {isLiked && (
        <View style={styles.heartCircle}>
          <TouchableOpacity>
            <View style={styles.heartCircleActive}>
              <TouchableOpacity>
                <Image
                  style={styles.heartIcon}
                  source={require('../assets/heart-icon-filled.png')}
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default bookmarkedBookCard;

const styles = StyleSheet.create({
  cardContainer: {
    padding: 10,
    color: 'white',
    display: 'flex',
    flexDirection: 'row',
  },
  book: {
    width: 130,
    height: 163,
  },
  title: {
    color: 'white',
    fontWeight: '700',
    width: 150,
    marginTop: -5,
    paddingTop: 0
  },
  author: {
    color: 'white',
    fontWeight: '200',
    marginTop: 5

  },
  featuredAuthor: {
    marginLeft: 15,
    
  },
  promptContainer: {
    backgroundColor: 'rgba(244, 238, 229, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    maxWidth: '90%',
    marginTop: 10,
  },
  prompt: {
    color: 'white',
    fontWeight: '600',
    width: 'auto',
  },
  bookSymbol: {
    width: 30,
    height: 30,
    overflow: 'visible',
  },
  bookSymbolCircle: {
    backgroundColor: 'rgba(155, 132, 100, 0.66)',
    justifyContent: 'center',
    alignItems: 'center',
    width: 56,
    height: 56,
    borderRadius: 50,
    position: 'absolute',
    top: -105,
    left: 22,
    zIndex: 1,
    overflow: 'visible',
  },
  bookContainer: {
    width: 100,
    marginLeft: -20,
  },
  contentContainer: {
    marginLeft: 20,
    alignSelf: 'flex-start',
  },
  infoContainer: {
    marginLeft: 35,
    marginTop: 35,
    width: 200,
  },
  heartIcon: {
    width: 22,
    height: 22,
    padding: 0,
    marginTop: 2,
  },
  heartCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(143, 120, 88, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 35,
    marginLeft: -30,
  },
  authorIcon:{
    width: 10,
    height: 10,
    marginRight: 5,
    marginTop: 10,
    position: 'absolute'
  }
});
