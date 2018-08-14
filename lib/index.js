'use strict';

/**
 * Module dependencies
 */

/* eslint-disable import/no-unresolved */
/* eslint-disable no-unused-vars */
// Public node modules.
const _ = require('lodash');
const AWS = require('aws-sdk');

module.exports = {
  provider: 'digitalocean',
  name: 'DigitalOcean Spaces',
  auth: {
    public: {
      label: 'Access API Token',
      type: 'text'
    },
    private: {
      label: 'Secret Access Token',
      type: 'text'
    },
    region: {
      label: 'Region',
      type: 'enum',
      values: [
        'nyc3'
      ]
    },
    bucket: {
      label: 'Bucket',
      type: 'text'
    }
  },
  init: (config) => {

    const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');

    // configure AWS DO bucket connection
    AWS.config.update({
      endpoint: spacesEndpoint,
      accessKeyId: config.public,
      secretAccessKey: config.private,
      region: 'NYC3'
    });


    const DO = new AWS.S3({
      apiVersion: 'latest',
      signatureVersion: 's3',
      params: {
        Bucket: config.bucket
      }
    });

    return {
      upload: (file) => {
        return new Promise((resolve, reject) => {
          // upload file on DO bucket
          DO.upload({
            Key: `${file.hash}${file.ext}`,
            Body: new Buffer(file.buffer, 'binary'),
            ACL: 'public-read'
          }, (err, data) => {
            if (err) {
              return reject(err);
            }

            // set the bucket file url
            file.url = data.Location;

            resolve();
          });
        });
      },
      delete: (file) => {
        return new Promise((resolve, reject) => {
          // delete file on DO bucket
          DO.deleteObjects({
            Delete: {
              Objects: [{
                Key: `${file.hash}${file.ext}`
              }]
            }
          }, (err, data) => {
            if (err) {
              return reject(err);
            }

            resolve();
          });
        });
      }
    };
  }
};
