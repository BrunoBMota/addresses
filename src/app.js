require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const {NODE_ENV} = require('./config');

const app = express();
const uuid = require('uuid');
const morganOption = (NODE_ENV === 'production') ? 'tiny' : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(express.json());

function validateBearerToken(req, res, next){
  const apiToken = process.env.API_TOKEN;
  console.log(apiToken);
  const authToken = req.get('Authorization')
  console.log(authToken);
  if(!authToken || authToken.split(' ').pop() !== apiToken){
    return res.status(401).json({error:'unauthorized request'})
  }
  next ();
}

const addresses =[
  {
  "id": "dce28457-4af4-4e03-be51-ed6ea9e112f6",
  "firstName": 'bruno',
  "lastName" : 'mota',
  'address1': '1234 road',
  'address2': 'suite 15',
  'city': 'orlando',
  'state': 'FL',
  'zip': '32807'},
  {
    "id": "d3146868-c603-4051-a7f0-e58045df14bf",
    "firstName": 'joe',
    "lastName" : 'schmo',
    'address1': '2222 street',
    'address2': 'suite 13',
    'city': 'orlando',
    'state': 'FL',
    'zip': '32807'},
]

app.get('/address', (req, res) => {
  res.status(200).json(addresses);
})

app.post('/address',validateBearerToken,  (req, res) => {
  const {firstName, lastName, address1, address2=false, city, state, zip} = req.body;
  console.log("firstname:" + firstName);

  if(!firstName){
    return res.status(400).send('first name is required')
  }

  if(!lastName){
    return res.status(400).send('last name is required')
  }

  if(!address1){
    return res.status(400).send('address is required')
  }

  if(!city){
    return res.status(400).send('city is required')
  }

  if(!state){
    return res.status(400).send('state is required')
  }

  if(!zip){
    return res.status(400).send('zip is required')
  }

  if (zip.length !== 5){
    return res.status(400).send('zip code must be at least 5 characters')
  }

  if (state.length !== 2) {
    return res.status(400).send('please enter state abbreviation')
  }

  const id = uuid();
  const newAddress = {
    id,
    firstName,
    lastName,
    address1,
    address2,
    city,
    state,
    zip
  }

  addresses.push(newAddress);

  res.status(201).location(`http://localhost:8000/address/${id}`).json({id: id});
  res.send('element added to array');
})

app.delete('/address/:userId', validateBearerToken, (req, res)=>{
  const {userId} = req.params;
  // res.send('got it!')
  const index = addresses.findIndex(address => address.id === userId)
  if (index === -1){
    return res.status(404).send('address does not exist')
  }
  else{
    addresses.splice(index, 1)
    res.status(204).end();
  }
})
    

app.use(function errorHandler(error, req, res, next) {
  let response
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } 
  else {
    console.error(error)
    response = { message: error.message, error }
  }
  res.status(500).json(response)
})

module.exports = app