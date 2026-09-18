# FiveNightsWithRice
Five Nights With Rice is a FNAF and [FNAW](https://g.lax1dude.net/fnaw) inspired game taking place in Sunset High School. The game is mostly written in typescript and uses a few helper scripts written in python to compile and compress assets.

## Compression
The entire game is packed into one html file using webpack, and it's only **2.72MB**. This is done by compressing all images, converting audio to ogg using FFMPEG. Unlike the FNAF, the static is generated using a function to minimize storage.

This compression perfectly fits the style of the game. CCTV cameras are known to have poor quality.

### Generative AI Use
Gemini and the Samsung Gallery app AI editor were used to convert images into nighttime or remove people. I understand that this may upset some people, but I do not have the time or budget for Photoshop. The people who took the photos could not go into the school at night to take photos (obviously).

## How to compile
`python3 removeFileData.py ./src/assets/ ./src/compAssets/`
`python3 compileAssets.py ./src/compAssets/`
`npm run build`

note: you only have to run the python commands when changing assets
