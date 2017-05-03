import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import App from './containers/App';
import configureStore from './store/configureStore';



const bigData = `
[
  {
    "id": 1,
    "tasteName": "Crime & Justice",
    "showNames": "Shades of Blue | Chicago P.D. | A Most Wanted Man",
    "key_art_path": "http://ib.huluim.com/assets/onboarding/25894_1518_855_artwork.jpg",
    "thumbnail_path": "http://ib.huluim.com/assets/onboarding/25894_300_300_thumbnail.jpg"
  },
  {
    "id": 2,
    "tasteName": "Sci-Fi Investigations",
    "showNames": "11.22.63 | The X-Files | Second Chance",
    "key_art_path": "http://ib.huluim.com/assets/onboarding/25954_1518_855_artwork.jpg",
    "thumbnail_path": "http://ib.huluim.com/assets/onboarding/25954_300_300_thumbnail.jpg"
  },
  {
    "id": 4,
    "tasteName": "Edgy Animation",
    "showNames": "South Park | Family Guy | The Simpsons",
    "key_art_path": "http://ib.huluim.com/assets/onboarding/6979_1518_855_artwork.jpg",
    "thumbnail_path": "http://ib.huluim.com/assets/onboarding/6979_300_300_thumbnail.jpg"
  },
  {
    "id": 8,
    "tasteName": "Acclaimed Comedies",
    "showNames": "Seinfeld | Brooklyn Nine-Nine | The Mindy Project",
    "key_art_path": "http://ib.huluim.com/assets/onboarding/23104_1518_855_artwork.jpg",
    "thumbnail_path": "http://ib.huluim.com/assets/onboarding/23104_300_300_thumbnail.jpg"
  },
  {
    "id": 16,
    "tasteName": "Investigative Procedurals",
    "showNames": "Law & Order: Special Victims Unit | Elementary | CSI: Crime Scene Investigation",
    "key_art_path": "http://ib.huluim.com/assets/onboarding/389_1242_699_artwork.jpg",
    "thumbnail_path": "http://ib.huluim.com/assets/onboarding/389_300_300_thumbnail.jpg"
  },
  {
    "id": 33,
    "tasteName": "Late Night",
    "showNames": "Saturday Night Live | The Daily Show With Trevor Noah | The Tonight Show Starring Jimmy Fallon",
    "key_art_path": "http://ib.huluim.com/assets/onboarding/77_1518_855_artwork.jpg",
    "thumbnail_path": "http://ib.huluim.com/assets/onboarding/77_300_300_thumbnail.jpg"
  },
  {
    "id": 38,
    "tasteName": "Superheroes",
    "showNames": "Heroes Reborn | Marvel's Agents of S.H.I.E.L.D. | Gotham",
    "key_art_path": "http://ib.huluim.com/assets/onboarding/24075_1518_855_artwork.jpg",
    "thumbnail_path": "http://ib.huluim.com/assets/onboarding/24075_300_300_thumbnail.jpg"
  }
]
`

const initialState = {
	counter: 0,
	payload: JSON.parse(bigData)
};


const store = configureStore(initialState);

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
