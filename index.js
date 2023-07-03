import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const express = require("express")
const app = express()
const pwds = require("./pwds.json")
const bodyParser = require('body-parser');

import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const supabase = createClient(process.env['SUPABASE_URL'], process.env['SUPABASE_TOKEN'])


app.use(bodyParser.json());

app.get("/", (req,res) => {
  res.send("1")
})

app.get("/urlshort", (req,res) => {
  res.sendFile('pages/short.html', {root: __dirname })
})

app.post("/pwdcheck", async (req,res) => {
  if(!req.body.password) return res.status(400).json({code: 400, message: "Gönderilen body içerisinde 'password' değeri yok"})
  if(!pwds[req.body.password]) return res.status(404).json({code: 404, message: "Gönderilen 'password' değeri kayıtlarımızda yok"})
  res.status(200).json({code: 200, message: pwds[req.body.password]})
  
})

app.post("/urlshort", async (req,res) => {
  if(!req.body.password) return res.status(400).json({code: 400, message: "Gönderilen body içerisinde 'password' değeri yok"})
  if(!pwds[req.body.password]) return res.status(404).json({code: 404, message: "Gönderilen 'password' değeri kayıtlarımızda yok"})

  if(!req.body.dizin) return res.status(400).json({code: 400, message: "Gönderilen body içerisinde 'dizin' değeri yok"})
  if(!req.body.url) return res.status(400).json({code: 400, message: "Gönderilen body içerisinde 'url' değeri yok"})
  let dizin = req.body.dizin;
  let user = pwds[req.body.password];
  let url = req.body.url;
   if(!/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/.test(url)) return res.status(400).json({code: 400, message: "Gönderilen url değeri geçerli bir url değil."})
  await supabase.from('urls').delete().eq('owner', user).eq('dizin', dizin);
  const { error } = await supabase.from('urls').insert({ owner: user, url: url, dizin: dizin });
  res.status(200).send("OK")
})

app.post("/deleteurl", async (req,res) => {
  if(!req.body.password) return res.status(400).json({code: 400, message: "Gönderilen body içerisinde 'password' değeri yok"})
  if(!pwds[req.body.password]) return res.status(404).json({code: 404, message: "Gönderilen 'password' değeri kayıtlarımızda yok"})

  if(!req.body.dizin) return res.status(400).json({code: 400, message: "Gönderilen 'dizin' değeri kayıtlarımızda yok"})

  let dizin = req.body.dizin;
  let user = pwds[req.body.password];

  await supabase.from('urls').delete().eq('owner', user).eq('dizin', dizin);
  res.status(200).send("OK")
})

app.get("/:owner/:dizin", async (req,res) => {
  let owner = req.params.owner;
  let dizin = req.params.dizin;
  
  let {data, error} = await  supabase.from('urls').select().eq('owner', owner).eq('dizin', dizin);
  if(data.length < 1 ) res.status(404).send("404 URL bulunamadı")
  res.redirect(data[0].url)
})

app.listen(3000)
