import logger from './logger';


const dummy = () => {};

const parseHyperledgerFabricResponsesForLog = (responses) => {
  responses.forEach((response) => {
    const entry = Object.keys(response)[0];
    logger[entry](response[entry]);
  });
};

export { parseHyperledgerFabricResponsesForLog, dummy };
