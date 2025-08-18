pipeline {
    agent any

    // Definisce le variabili per facilitare la modifica dei valori.
    environment {
        // L'ID delle credenziali configurate in Jenkins, che puntano al tuo account di servizio GCP.
        GCP_CREDENTIALS_ID = 'gcp-service-account2' 
        
        // Il percorso completo del tuo repository in Artifact Registry.
        DOCKER_IMAGE_REPO = 'europe-west8-docker.pkg.dev/core-synthesis-468711-k5/randomfilm'
        
        // Il nome dell'immagine che stai costruendo.
        DOCKER_IMAGE_NAME = 'frontend'
        
        // Il tag dell'immagine.
        DOCKER_IMAGE_TAG = 'latest'
    }

    // Le diverse fasi della pipeline.
    stages {
        // Fase 1: Verifica la connessione e l'autenticazione con Google Cloud.
        stage('Verify GCP Connection') {
            steps {
                script {
                    // Usa il blocco 'withCredentials' per rendere disponibile il file della chiave.
                    withCredentials([file(credentialsId: env.GCP_CREDENTIALS_ID, variable: 'GOOGLE_APPLICATION_CREDENTIALS')]) {
                        // Attiva l'account di servizio usando il file della chiave.
                        sh 'gcloud auth activate-service-account --key-file=$GOOGLE_APPLICATION_CREDENTIALS'

                        // Verifica l'autenticazione.
                        echo "Verifica autenticazione gcloud..."
                        sh "gcloud auth list"

                        // Verifica il progetto GCP.
                        echo "Verifica progetto GCP..."
                        sh "gcloud config list project"

                        echo "Connessione a GCP riuscita! 🎉"
                    }
                }
            }
        }

        // Fase 2: Costruisce l'immagine Docker.
        stage('Build Docker Image') {
            steps {
                echo 'Building the Docker image...'
                // Esegue il comando docker build utilizzando il Dockerfile_test.
                sh "docker build -t ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} -f Dockerfile.frontend ."
            }
        }

        // Fase 3: Esegue il tag e il push dell'immagine al registry di Google Cloud.
        stage('Tag and Push Docker Image') {
            steps {
                script {
                    // Anche in questo stage è necessaria l'autenticazione.
                    withCredentials([file(credentialsId: env.GCP_CREDENTIALS_ID, variable: 'GOOGLE_APPLICATION_CREDENTIALS')]) {
                        sh 'gcloud auth activate-service-account --key-file=$GOOGLE_APPLICATION_CREDENTIALS'

                        echo 'Configuring Docker for Artifact Registry...'
                        // Configura Docker per usare gcloud come helper per l'autenticazione.
                        sh "gcloud auth configure-docker europe-west8-docker.pkg.dev"

                        echo 'Tagging the Docker image...'
                        // Tagga l'immagine locale con il percorso completo del repository remoto.
                        sh "docker tag ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} ${DOCKER_IMAGE_REPO}/${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}"

                        echo 'Pushing the Docker image to Artifact Registry...'
                        // Esegue il push dell'immagine al repository in Google Cloud.
                        sh "docker push ${DOCKER_IMAGE_REPO}/${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}"
                    }
                }
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                script {
                    withCredentials([file(credentialsId: env.GCP_CREDENTIALS_ID, variable: 'GOOGLE_APPLICATION_CREDENTIALS')]) {
                        sh '''
                        echo ">>> Autenticazione a GCP..."
                        gcloud auth activate-service-account --key-file=$GOOGLE_APPLICATION_CREDENTIALS

                        echo ">>> Configurazione accesso cluster GKE..."
                        export USE_GKE_GCLOUD_AUTH_PLUGIN=True
                        gcloud container clusters get-credentials randomfilm --region europe-west8 --project core-synthesis-468711-k5

                        echo ">>> Riavvio del deployment ${DOCKER_IMAGE_NAME}..."
                        kubectl rollout restart deployment/${DOCKER_IMAGE_NAME} -n randomfilm

                        echo ">>> Attesa completamento rollout..."
                        kubectl rollout status deployment/${DOCKER_IMAGE_NAME} -n randomfilm
                        '''
                    }
                }
            }
        }
    }
}