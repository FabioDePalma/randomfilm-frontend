pipeline {
    agent any
    
    environment {
        // Configurazione delle variabili d'ambiente
        DOCKER_IMAGE = 'frontend-build-spa'
        GCS_BUCKET = 'gs://randomfilm-frontend/'
        DIST_FOLDER = '/app/dist'
    }
    
    stages {
        stage('Cleanup') {
            steps {
                script {
                    // Pulizia immagini Docker esistenti (opzionale)
                    sh '''
                        docker rmi ${DOCKER_IMAGE} || true
                        docker system prune -f || true
                    '''
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    echo 'Building Docker image...'
                    sh 'docker build -t ${DOCKER_IMAGE} -f DockerfileBuildSPA .'
                }
            }
        }
        
        stage('Extract Build Artifacts') {
            steps {
                script {
                    echo 'Creating container and extracting dist folder...'
                    sh '''
                        # Crea il container senza avviarlo
                        CONTAINER_ID=$(docker create ${DOCKER_IMAGE})
                        echo "Container ID: $CONTAINER_ID"
                        
                        
                        # Copia la cartella dist dal container
                        docker cp $CONTAINER_ID:${DIST_FOLDER} ./
                        
                        # Pulisci il container
                        docker rm $CONTAINER_ID
                        
                        # Verifica che la cartella dist esista
                        if [ ! -d "dist" ]; then
                            echo "Errore: cartella dist non trovata!"
                            exit 1
                        fi
                        
                        # Mostra il contenuto della cartella dist
                        echo "Contenuto cartella dist:"
                        ls -la dist/
                    '''
                }
            }
        }
        
        stage('Deploy to Google Cloud Storage') {
            steps {
                script {
                    echo 'Deploying to Google Cloud Storage...'
                    sh '''
                        # Verifica che gcloud sia configurato
                        gcloud auth list
                        
                        # Carica tutti i file della cartella dist su GCS
                        gcloud storage cp dist/* ${GCS_BUCKET} --recursive
                        
                        echo "Deploy completato su ${GCS_BUCKET}"
                    '''
                }
            }
        }
        
        stage('Cleanup Artifacts') {
            steps {
                script {
                    echo 'Cleaning up local artifacts...'
                    sh '''
                        # Rimuovi la cartella dist locale
                        rm -rf dist/
                        
                        # Rimuovi l'immagine Docker (opzionale)
                        docker rmi ${DOCKER_IMAGE} || true
                    '''
                }
            }
        }
    }
    
    post {
        always {
            script {
                echo 'Pipeline completata'
            }
        }
        success {
            script {
                echo 'Deploy completato con successo!'
            }
        }
        failure {
            script {
                echo 'Pipeline fallita. Controllare i log.'
                // Cleanup in caso di errore
                sh '''
                    # Rimuovi container orfani
                    docker ps -a --filter "ancestor=${DOCKER_IMAGE}" --format "{{.ID}}" | xargs -r docker rm -f
                    
                    # Rimuovi cartella dist se presente
                    rm -rf dist/ || true
                '''
            }
        }
    }
}