/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-expressions */
const request = require('supertest');
const httpStatus = require('http-status');
const { expect } = require('chai');
const { some } = require('lodash');
const app = require('../../../index');
const User = require('../../models/user.model');
const Invitation = require('../../models/invitation.model');
// const { updateUser } = require('../../validations/user.validation');
// const emailProvider = require('../../services/emails/emailProvider');

describe('INVITATION API', async () => {
  let userAccessToken;
  let user;
  let invitation1;
  let invitation2;

  // const password = '123456';
  // const passwordHashed = await bcrypt.hash(password, 1);

  before(async () => {
    await Invitation.deleteMany({});
    await User.deleteMany({});
  });

  beforeEach(async () => {
    user = {
      _id: '41224d776a326fb40f000001',
      email: 'user1@gmail.com',
      password: '123456',
      name: 'Admin User',
      role: 'admin',
    };

    invitation1 = {
      invitedEmail: 'test.invited1@test.com',
    };

    invitation2 = {
      invitedEmail: 'test.invited22@test.com',
    };

    await User.deleteMany({});

    await User.create(user);
    userAccessToken = (await User.findAndGenerateToken(user)).accessToken;
  });

  describe('POST /v1/users/:userId/invitations', () => {
    it('should create a new invitation from user', () => {
      return request(app)
        .post(`/v1/users/${user._id}/invitations`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(invitation1)
        .expect(httpStatus.CREATED)
        .then((res) => {
          expect(res.body).to.have.a.property('_id');
          expect(res.body).to.have.a.property('verificationCode');
          expect(res.body.invitedBy).to.be.equal(user._id);
          expect(res.body.invitedEmail).to.be.equal(invitation1.invitedEmail);
          invitation1._id = res.body._id;
        });
    });

    it('should create a new invitation from user', () => {
      return request(app)
        .post(`/v1/users/${user._id}/invitations`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(invitation2)
        .expect(httpStatus.CREATED)
        .then((res) => {
          invitation2._id = res.body._id;
          expect(res.body).to.have.a.property('_id');
          expect(res.body).to.have.a.property('verificationCode');
          expect(res.body.invitedBy).to.be.equal(user._id);
          expect(res.body.invitedEmail).to.be.equal(invitation2.invitedEmail);
        });
    });
  });

  describe('GET /v1/users/:userId/invitations', () => {
    it('should get invitations by user', () => {
      return request(app)
        .get(`/v1/users/${user._id}/invitations`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.OK)
        .then(async (res) => {
          const includesInv1 = some(res.body, invitation1);
          const includesInv2 = some(res.body, invitation2);

          expect(res.body).to.be.an('array');
          expect(res.body).to.have.lengthOf(2);
          expect(includesInv1).to.be.true;
          expect(includesInv2).to.be.true;
        });
    });
  });

  describe('GET /v1/users/:userId/invitations/:invitationId', () => {
    it('should get invitations by id', async () => {
      const inv = await Invitation.findOne({ invitedEmail: 'test.invited1@test.com' });
      return request(app)
        .get(`/v1/users/${user._id}/invitations/${inv._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.OK)
        .then(async (res) => {
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.a.property('_id');
          expect(res.body).to.have.a.property('invitedBy');
          expect(res.body).to.have.a.property('invitedEmail');
          expect(res.body).to.have.a.property('verificationCode');
          expect(res.body.invitedEmail).to.be.equal(invitation1.invitedEmail);
        });
    });
  });

  describe('DELETE /v1/users/:userId/invitations/:invitationId', () => {
    it('should delete invitation', async () => {
      const inv = await Invitation.findOne({ invitedEmail: 'test.invited1@test.com' });

      return request(app)
        .delete(`/v1/users/${user._id}/invitations/${inv._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.NO_CONTENT)
        .then(() => {
          request(app)
            .get(`/v1/users/${user._id}/invitations`)
            .set('Authorization', `Bearer ${userAccessToken}`)
            .then(async (res) => {
              expect(res.body).to.have.lengthOf(1);
            });
        });
    });
  });
});
