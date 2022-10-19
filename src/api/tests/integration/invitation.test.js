// /* eslint-disable arrow-body-style */
// /* eslint-disable no-unused-expressions */
// const request = require('supertest');
// const httpStatus = require('http-status');
// const { expect } = require('chai');
// const bcrypt = require('bcryptjs');
// const app = require('../../../index');
// const User = require('../../models/user.model');
// const Invitation = require('../../models/invitation.model');
// const { updateUser } = require('../../validations/user.validation');
// // const emailProvider = require('../../services/emails/emailProvider');

// describe('Invitations API', async () => {
//   let userAccessToken;
//   let user;
//   let userId;
//   let invitation;

//   const password = '123456';
//   const passwordHashed = await bcrypt.hash(password, 1);

//   before(async () => {
//     await Invitation.deleteMany({});
//     await User.deleteMany({});
//   });

//   beforeEach(async () => {
//     user = {
//       email: 'user1@gmail.com',
//       password: passwordHashed,
//       name: 'Admin user',
//       role: 'admin',
//     };

//     invitation = {
//       invitedEmail: 'testInvited@test.com',
//     };

//     await Invitation.deleteMany({});
//     await User.deleteMany({});

//     await User.create(user);
//     userAccessToken = (await User.findAndGenerateToken(user)).accessToken;
//     userId = (await User.findOne({ email: user.email }).exec())._id;
//   });

//   describe('POST /v1/users/:userId/invitations', async () => {
//     // save user _ids and update local objects from db
//     // const locUser = await User.findOne({ email: user.email }).exec();
//     // console.log('-----------------------');
//     // console.log(locUser);

//     it('should create a new invitation from user', () => {
//       return request(app)
//         .post(`/v1/users/${userId}/invitations`)
//         .set('Authorization', `Bearer ${userAccessToken}`)
//         .send(invitation)
//         .expect(httpStatus.CREATED)
//         .then((res) => {
//           console.log(res.body);
//           // delete admin.password;
//           expect(res.body._id);
//           // expect(res.body.code).to.be.equal(httpStatus.CREATED);
//         });
//     });
//   });

//   // describe('GET /v1/users/:userId/invitations', () => {

//   // });

//   // describe('GET /v1/users/:userId/invitations/:invitationId', () => {

//   // });

//   // describe('DELETE /v1/users/:userId/invitations/:invitationId', () => {

//   // });
// });
