# FiveNightsWithRice
Five Nights With Rice is a FNAF inspired game taking place in Sunset High School. The game is mostly written in typescript and uses a few helper scripts written in python to compile and compress assets.

## How to compile
`python3 removeFileData.py ./src/assets/ ./src/compAssets/`
`python3 compileAssets.py ./src/compAssets/`
`npm run build`

note: you only have to run the python commands when changing assets