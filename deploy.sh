docker-compose build
docker-compose push
gcloud run deploy wordn-frontend --project=wordn-338419 --port=3000 --max-instances=100 --allow-unauthenticated --region=europe-west4 --image=europe-west4-docker.pkg.dev/wordn-338419/images/wordn.frontend:latest
gcloud run deploy wordn-backend --project=wordn-338419 --port=4000 --max-instances=100 --allow-unauthenticated --region=europe-west4 --image=europe-west4-docker.pkg.dev/wordn-338419/images/wordn.backend:latest