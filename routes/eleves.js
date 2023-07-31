var express = require('express')
var router = express.Router()

// import necessaire pour crer les routes
require('@config/config');
const Eleve= require ('@models/eleves');
const uid2 = require('uid2')
const bcrypt = require('bcrypt');

const { checkBody } = require('@modules/checkBody')
const { isValidEmail } = require ('@modules/emailValidator');
const { sendResetPasswordEmail } = require('@modules/sendResetPasswordEmail');
const { isStrongPassword } = require('@modules/passwordValidator');

//routes post pour s'enregistrer en tant qu'élève
// Vérifiez si les champs sont remplies
    router.post('/signup', (req, res) => {
    if (!checkBody(req.body, ['nom', 'prenom', 'email', 'fonction', 'mot_de_passe'])) {
        res.json({ result: false, error: 'Champs manquants ou vides' });
        return
    }
  // Validez l'adresse e-mail avec la regex EMAIL_REGEX
  if (!isValidEmail(req.body.email)) {
    res.json({ result: false, error: 'Adresse e-mail invalide' });
    return;
  };

  // Vérifiez si le mot de passe est très fort
//   if (!isStrongPassword(req.body.mot_de_passe)) {
//     res.json({ result: false, error: 'Le mot de passe doit comporter au moins 8 caractères, dont au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial (@$!%*?&)',});
//     return;
//   };

    // Vérifiez si l'utilisateur n'est pas déjà inscrit
    Eleve.findOne({ email: req.body.email }).then(data =>{
        if(data === null) {
            const hash = bcrypt.hashSync(req.body.mot_de_passe, 10);
            const newEleve = new Eleve({
                nom: req.body.nom,
                prenom: req.body.prenom,
                email: req.body.email,
                fonction: req.body.fonction,
                mot_de_passe: hash,
                token: uid2(32),
        });
        newEleve.save().then(newDoc => {
            res.json({ result: true, token: newDoc.token });
        });
    } else { 
    // L'utilisateur existe déjà dans la base de données.
    res.json({ result: false, error: 'L\'utilisateur existe déjà' });
        }
    });
});

//routes post pour se connecter en tant qu'élève
// Vérifiez si les champs sont remplies
    router.post('/signin', (req, res) => {
        if (!checkBody(req.body, ['email', 'mot_de_passe'])) {
        res.json({ result: false, error: 'Champs manquants ou vides' });
        return;
        }
// Validez l'adresse e-mail avec la regex EMAIL_REGEX
        if (!isValidEmail(req.body.email)) {
            res.json({ result: false, error: 'Adresse e-mail invalide' });
            return;
        };

// Rechercher l'utilisateur dans la base de données 
        Eleve.findOne({ email: req.body.email }).then(data => {
        if (data && bcrypt.compareSync(req.body.mot_de_passe, data.mot_de_passe)) {
            res.json({ result: true, token: data.token });
        } else {
            res.json({ result: false, error: 'Utilisateur introuvable ou mot de passe incorrect' });
        }
        });
    });

    // Route pour demander la réinitialisation de mot de passe
    router.post('/forgot-password', (req, res) => {
    const { email } = req.body;
  
    // Vérifier si l'adresse e-mail est valide
    if (!isValidEmail(email)) {
      return res.json({ result: false, error: 'Adresse e-mail invalide' });
    }
  
    // Rechercher l'utilisateur dans la base de données
    Eleve.findOne({ email }).then(user => {
      if (!user) {
        return res.json({ result: false, error: 'Adresse e-mail non trouvée' });
      }
  
      // Générer un jeton de réinitialisation unique
      const resetToken = uid2(32);
  
      // Enregistrer le jeton de réinitialisation dans la base de données pour l'utilisateur
      user.resetToken = resetToken;
      user.save().then(() => {
        // Envoyer le jeton de réinitialisation à l'adresse e-mail de l'utilisateur
        sendResetPasswordEmail(user.email, resetToken);
  
        res.json({ result: true, message: 'Instructions de réinitialisation de mot de passe envoyées à votre adresse e-mail' });
      });
    });
  });

// Route pour  la réinitialisation de mot de passe
  router.post('/reset-password', (req, res) => {
    const { email, resetToken, newMpot_de_passe } = req.body;
  
    // Vérifier si le jeton de réinitialisation est valide et correspond à l'utilisateur dans la base de données
    Eleve.findOne({ email, resetToken }).then(user => {
      if (!user) {
        return res.json({ result: false, error: 'Jeton de réinitialisation invalide ou expiré' });
      }
  
      // Mettre à jour le mot de passe avec le nouveau mot de passe haché
      const hash = bcrypt.hashSync(newMpot_de_passe, 10);
      user.mot_de_passe = hash;
  
      // Supprimer le jeton de réinitialisation
      user.resetToken = undefined;
  
      user.save().then(() => {
        res.json({ result: true, message: 'Le mot de passe a été réinitialisé avec succès' });
      });
    });
  });
  



module.exports = router
