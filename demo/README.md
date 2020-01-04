- `yarn install`
- `yarn build`
- `yarn start:dev`

Server runs on `http://localhost:8080/dist`. Only the first frame of the test video is displayed as the decoder expects
individual access units (frames) on each decode operation.
