FROM node:19.2

ENV USER=croutonbot

# create croutonbot user
RUN groupadd -r ${USER} && \
	useradd --create-home --home /home/croutonbot -r -g ${USER} ${USER}

# set up volume and user
USER ${USER}
WORKDIR /home/croutonbot

COPY --chown=${USER}:${USER} package*.json ./
RUN npm install
VOLUME [ "/home/croutonbot" ]

COPY --chown=${USER}:${USER}  . .

ENTRYPOINT [ "npm", "run", "start" ]