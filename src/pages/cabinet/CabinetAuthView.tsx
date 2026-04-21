import CabinetAuth from "@/components/cabinet/CabinetAuth";
import { useCabinetAuth } from "@/pages/cabinet/useCabinetAuth";

type AuthReturn = ReturnType<typeof useCabinetAuth>;

interface CabinetAuthViewProps {
  auth: AuthReturn;
}

export default function CabinetAuthView({ auth }: CabinetAuthViewProps) {
  return (
    <CabinetAuth
      loginMode={auth.loginMode} setLoginMode={auth.setLoginMode}
      regStep={auth.regStep} setRegStep={auth.setRegStep}
      resetStep={auth.resetStep} setResetStep={auth.setResetStep}
      loginIdentifier={auth.loginIdentifier} setLoginIdentifier={auth.setLoginIdentifier}
      loginPassword={auth.loginPassword} setLoginPassword={auth.setLoginPassword}
      loginName={auth.loginName} setLoginName={auth.setLoginName}
      loginPhone={auth.loginPhone} setLoginPhone={auth.setLoginPhone}
      loginEmail={auth.loginEmail} setLoginEmail={auth.setLoginEmail}
      loginCity={auth.loginCity} setLoginCity={auth.setLoginCity}
      regCode={auth.regCode} setRegCode={auth.setRegCode}
      regPassword={auth.regPassword} setRegPassword={auth.setRegPassword}
      regPasswordConfirm={auth.regPasswordConfirm} setRegPasswordConfirm={auth.setRegPasswordConfirm}
      resetEmail={auth.resetEmail} setResetEmail={auth.setResetEmail}
      resetCode={auth.resetCode} setResetCode={auth.setResetCode}
      resetPassword={auth.resetPassword} setResetPassword={auth.setResetPassword}
      resetPasswordConfirm={auth.resetPasswordConfirm} setResetPasswordConfirm={auth.setResetPasswordConfirm}
      loginError={auth.loginError} loginLoading={auth.loginLoading}
      onLogin={auth.handleLogin}
      onRegister={auth.handleRegister}
      onVerifyCode={auth.handleVerifyCode}
      onSetPassword={auth.handleSetPassword}
      onResetRequest={auth.handleResetRequest}
      onResetConfirm={auth.handleResetConfirm}
    />
  );
}
