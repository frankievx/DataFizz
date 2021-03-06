import React, { PropTypes, Component } from 'react';
import axios from 'axios';
import styles from './signin.css';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Snackbar from 'material-ui/Snackbar';
import {
  Step,
  Stepper,
  StepLabel,
} from 'material-ui/Stepper';


export default class ResetPasswordForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			message: '',
			finished: false,
    	stepIndex: 0,
    	email: '',
			emailError: '',
			emailValid: false,
			token: '',
			newPassword: '',
			newPasswordValid: false,
			confirmPassword: '',
			confirmPasswordValid: false,
			nextDisabled: true
		}
	}

	static propTypes = {
		open: PropTypes.bool.isRequired,
		handleClose: PropTypes.func.isRequired,
		handleNotification: PropTypes.func.isRequired
	};

	componentWillUpdate(nextProps, nextState) {
    if(nextState.finished) {
    	this.handleSubmit();
    	nextProps.handleClose();
    	this.setState({ finished: false });
    }
  }

	handleNext() {
    const { stepIndex } = this.state;
	    this.setState({
	      stepIndex: stepIndex + 1,
	      finished: stepIndex >= 3,
	      nextDisabled: true
	    });
  }

  handlePrev() {
    const { stepIndex } = this.state;
    if (stepIndex > 0) {
      this.setState({stepIndex: stepIndex - 1});
    }
    this.enableNext();
  };

  handleSend() {
  	const { email } = this.state;

  	axios.post('/reset/forgot', {
  		email: email 
  	}).then(function(res) {
  		console.log('submit response', res);
  		handleNotification(res.data.message);
  	})
  }

  handleSubmit() {
  	const { handleNotification } = this.props;
  	const { email, token, newPassword, confirmPassword } = this.state;

  	axios.post('/reset/password', {
  		email: email,
  		token: token,
  		newPassword: newPassword,
  		confirmPassword: confirmPassword
  	})
  	.then(function(res){
  		console.log('submit response', res);
  		handleNotification(res.data.message);
  	})
  }


  validateEmail(email) {
    const regex = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
    return regex.test(email);
	}

	validatePassword(password) {
		if (password.length > 7 ) return true;
		else return false;
	}

  enableNext() {
  	this.setState({
  		nextDisabled: false
  	});
  }

  disableNext() {
  	this.setState({
  		nextDisabled: true
  	});
  }

	emailChange(e) {
		e.preventDefault();
		if(!this.validateEmail(e.target.value)) {
			this.setState({
				email: e.target.value,
				emailError: 'Please enter a valid email.',
				emailValid: false
			});
			this.disableNext()
		}
		else {
			this.setState({
				email: e.target.value,
				emailError: '',
				emailValid: true
			});
			this.enableNext();
		}
	}

	tokenChange(e) {
		e.preventDefault();
		this.setState({
			token: e.target.value,
		});
		this.enableNext();
	}

	newPasswordChange(e) {
		e.preventDefault();
		if(!this.validatePassword(e.target.value)) {
			this.setState({
				newPassword: e.target.value,
				passwordError: 'Password must be at least 8 characters long.',
				newPasswordValid: false
			});
			this.disableNext()
		}
		else{
			this.setState({
				newPassword: e.target.value,
				passwordError: '',
				newPasswordValid: true
			});
			this.enableNext();
		}
	}

	confirmPasswordChange(e) {
		const { newPassword } = this.state;

		e.preventDefault();
		if(newPassword != e.target.value) {
			this.setState({
				confirmPassword: e.target.value,
				passwordError: 'Passwords do not match.',
				confirmPasswordValid: false
			});
			this.disableNext();
		}
		else{
			this.setState({
				confirmPassword: e.target.value,
				passwordError: '',
				confirmPasswordValid: true
			});
		}
		this.enableNext();
	}

	getStepContent(stepIndex) {
		const { email, token, newPassword, confirmPassword, emailError, passwordError } = this.state;
    switch (stepIndex) {
      case 0:
        return (
        	<TextField
        		className={styles.textField}
						onChange={this.emailChange.bind(this)}
						value={email}
						floatingLabelText='Email'
						errorText={emailError}
					/>
      	)
      case 1:
	      return (
	      	<div>
	        	<h5> Click the 'Send Token' button to send a token that expires in 5 minutes.
	        	 Then copy and paste the token received in your email into the text field below.</h5>
	        	<RaisedButton
							label='Send Token'
							onClick={this.handleSend.bind(this)}
						/>
						<br/>
						<TextField
							className={styles.textField}
				    	onChange={this.tokenChange.bind(this)}
				    	value={token}
				      floatingLabelText='Enter the token sent to your email.'
				    />
			    </div>
		    )
      case 2:
        return (
        	<TextField
        		className={styles.textField}
						onChange={this.newPasswordChange.bind(this)}
						value={newPassword}
						type='password'
						floatingLabelText='New Password'
						errorText={passwordError}
					/>
      	)
      case 3:
        return (
        	<TextField
        		className={styles.textField}
						onChange={this.confirmPasswordChange.bind(this)}
						value={confirmPassword}
						type='password'
						floatingLabelText='Confirm New Password'
						errorText={passwordError}
					/>
      	)
    	default:
    		return;
    }
  }


  render() {
  	const { open, handleClose} = this.props;
  	const { stepIndex, nextDisabled, finished, notify, message } = this.state;
  	const contentStyle = { width: '80%', maxWidth: 'none' };
  	const actions = [
      <FlatButton
        label='Back'
        disabled={stepIndex === 0}
        primary={true}
        onTouchTap={this.handlePrev.bind(this)}
      />,
      <FlatButton
        label={stepIndex === 3 ? 'Submit' : 'Next'}
        disabled={nextDisabled}
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.handleNext.bind(this)}
      />,
    ];

    return (
    	<Dialog
    		title='Forgot Password Form'
    		contentStyle={contentStyle}
    		actions={actions}
    		open={open}
    		onRequestClose={handleClose}>
    		<Stepper activeStep={stepIndex}>
          <Step>
            <StepLabel>Enter Current Email</StepLabel>
          </Step>
          <Step>
            <StepLabel>Enter Reset Token</StepLabel>
          </Step>
          <Step>
            <StepLabel>Enter New Password</StepLabel>
          </Step>
          <Step>
            <StepLabel>Confirm New Password</StepLabel>
          </Step>
        </Stepper>
      	<div className={styles.formField}> { this.getStepContent(stepIndex) } </div>
  		</Dialog>
    );
  }
}