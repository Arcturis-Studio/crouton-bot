FROM node:19.2

ENV USER=registercommands

# create registercommands user
RUN groupadd -r ${USER} && \
	useradd --create-home --home /home/registercommands -r -g ${USER} ${USER}

# set up volume and user
USER ${USER}
WORKDIR /home/registercommands

COPY --chown=${USER}:${USER} package*.json ./
RUN npm install
VOLUME [ "/home/registercommands" ]

COPY --chown=${USER}:${USER}  . .

ENTRYPOINT [ "npm", "run", "start" ]