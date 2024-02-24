# This is Project No. 2 from Capstone projects

Demo Link :: https://github.com/aakashgaikwad/capston_project_node/blob/main/2024-02-24-20-33-52.mp4
## Objective 
### Below is the objective of project as per requirement::

Kingston Inc, a prominent technology company, faces a crucial challenge in efficiently
configuring, provisioning, and monitoring its Node.js applications. As Kingston Inc continues to
expand its portfolio of Node.js applications, ensuring their smooth deployment, scalability, and
observability has become a top priority. To address this challenge, Kingston Inc aims to
undertake a project focused on configuring, provisioning, and monitoring Node.js applications
effectively. This project aims to ensure the seamless deployment of Node.js applications,
leveraging modern technologies and best practices while embracing the growing demand for
reliable web services.

## Prerequisites
1. Docker hub account.
2. github account (To push code)
3. AWS account-optional (As deployment is hosted on aws linux server, this can be done on local machine).

## Solution ::
To fullfill above obective I have followed below steps ::
## Create node js application 
1. Created node js application with respective pages which can perform CRUD operations on users.
2. Integrated mongodb as a database to store data in database.

## Create deployment related files.
### 1 Docker file
1. Created docker file to containerize application.
2. Docker file includes steps to install node as dependencies and install application dependencies from package.json file.
3. Docker file also includes steps to copy build files to container and running the application.

### 2 Files related to kubernetes deployment and ingress configurations.
1. Created deployment.yml file to create deployment, added replica sets and container ports.
2. Created service.yml file to expose the deployment.
3. Created ingress.yml file which will be used to expose the application to outside world.
    
### 3 Files related to Jenkin.
- Created Jenkin file which includes below jenkin pipeline steps.
- - It includes below steps::
  - Setting environment variables like docker registery etc
  - Checkout:: Fetching souce code from git
  - Build Image
  - Push To DockerHub
  - Deploy & Publish application

# Infrastructure Set up
## This includes below steps.
1. Creating AWS EC2 linux instance for application (used t2.medium).
2. Creating AWS EC2 linux instance for Prometheus (t2.medium).
3. Creating AWS EC2 linux instance for Grafana (t2.medium).
4. Installing below dependencies
   - Docker
   - Minikube
   - Java
   - Jenkins
   - Prometheus
   - Grafana

## Docker & Minikube installation 
## Minikube on AWS EC2

### Install docker on EC2 Ubantu
```
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg lsb-release

sudo mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo chmod a+r /etc/apt/keyrings/docker.gpg
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo systemctl status docker
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
newgrp docker
sudo systemctl restart docker
docker ps
```

### Install Kubectl
```
https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/
```
```
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
mv kubectl /bin/kubectl
chmod a+x /bin/kubectl
```

### Install Minikube
```
https://aws.plainenglish.io/running-kubernetes-using-minikube-cluster-on-the-aws-cloud-4259df916a07
https://minikube.sigs.k8s.io/docs/start/
https://minikube.sigs.k8s.io/docs/drivers/none/#requirements
```
```
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/bin/minikube
sudo apt install conntrack -y
```
If you want to use the combination of the none driver from Kubernetes v1.24+ the Docker container runtime you'll need to install cri-dockerd on your system
Install cri-dockerd & Install go
### Install cri-dockerd
```
apt install git -y
apt  install golang-go
git clone https://github.com/Mirantis/cri-dockerd.git
```
```
mkdir bin
VERSION=$((git describe --abbrev=0 --tags | sed -e 's/v//') || echo $(cat VERSION)-$(git log -1 --pretty='%h')) PRERELEASE=$(grep -q dev <<< "${VERSION}" && echo "pre" || echo "") REVISION=$(git log -1 --pretty='%h')
go build -ldflags="-X github.com/Mirantis/cri-dockerd/version.Version='$VERSION}' -X github.com/Mirantis/cri-dockerd/version.PreRelease='$PRERELEASE' -X github.com/Mirantis/cri-dockerd/version.BuildTime='$BUILD_DATE' -X github.com/Mirantis/cri-dockerd/version.GitCommit='$REVISION'" -o cri-dockerd
```
```
# Run these commands as root
###Install GO###
wget https://storage.googleapis.com/golang/getgo/installer_linux
chmod +x ./installer_linux
./installer_linux
source ~/.bash_profile
```
```
cd cri-dockerd
mkdir bin
go build -o bin/cri-dockerd
mkdir -p /usr/local/bin
install -o root -g root -m 0755 bin/cri-dockerd /usr/local/bin/cri-dockerd
cp -a packaging/systemd/* /etc/systemd/system
sed -i -e 's,/usr/bin/cri-dockerd,/usr/local/bin/cri-dockerd,' /etc/systemd/system/cri-docker.service
systemctl daemon-reload
systemctl enable cri-docker.service
systemctl enable --now cri-docker.socket
```

### Install CRICTL
https://github.com/kubernetes-sigs/cri-tools/blob/master/docs/crictl.md
```
VERSION="v1.26.0" # check latest version in /releases page
wget https://github.com/kubernetes-sigs/cri-tools/releases/download/$VERSION/crictl-$VERSION-linux-amd64.tar.gz
sudo tar zxvf crictl-$VERSION-linux-amd64.tar.gz -C /usr/local/bin
rm -f crictl-$VERSION-linux-amd64.tar.gz

cat <<EOF | sudo tee /etc/crictl.yaml
runtime-endpoint: unix:///run/containerd/containerd.sock
image-endpoint: unix:///run/containerd/containerd.sock
timeout: 2
debug: false
pull-image-on-create: false
EOF
```
### Install containernetworking-plugins
Pick the version from here -> https://github.com/containernetworking/plugins/releases
```
CNI_PLUGIN_VERSION="<version_here>"
CNI_PLUGIN_TAR="cni-plugins-linux-amd64-$CNI_PLUGIN_VERSION.tgz" # change arch if not on amd64
CNI_PLUGIN_INSTALL_DIR="/opt/cni/bin"

curl -LO "https://github.com/containernetworking/plugins/releases/download/$CNI_PLUGIN_VERSION/$CNI_PLUGIN_TAR"
sudo mkdir -p "$CNI_PLUGIN_INSTALL_DIR"
sudo tar -xf "$CNI_PLUGIN_TAR" -C "$CNI_PLUGIN_INSTALL_DIR"
rm "$CNI_PLUGIN_TAR"
```
### Start Minikube
```
minikube start --vm-driver=none
```


## Set up Jenkins ::
### Jenkins Install & Configuration  
```
- sudo apt update 
- sudo apt install openjdk-8-jdk  
- sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo  
- sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key  
- yum install jenkins -y  
- sudo systemctl start jenkins  
``` 

### Update below config file  
vi ~/.bashrc  
export JAVA_HOME=/usr/lib/jvm/java-17-amazon-corretto-devel  
source ~/.bashrc  

## Set up Jenkin and deployment pipeline 
 - Add port 8080 as a inbound rule in security group
 - Access application on http://serverip:8080/
 - To get default password use below command
   ```
   -sudo cat /var/lib/jenkins/secrets/initialAdminPassword
   ```
 - Set up new password
 - Add Jenkins plugins like kubernetes, docker in Jenkins plugin Manager.
 - Set up secrets for Docker hub registery , github , Kubeconfig etc from .
 - Create new pipeline and give path of git jenkin file.
 - Run the pipeline.
 - Access the website on http://serverip:30000/


