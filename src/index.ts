import app from './app/app';

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.info(`App running on port: http://localhost:${port}`);
});
