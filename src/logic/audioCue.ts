import { Audio } from 'expo-av';

const CUE_URI =
  'data:audio/wav;base64,UklGRiQFAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAFAAAAAKIgSjLdLNgSLvDG1DXN9NzK/BcelzFTLswVRfOV1ujMrtqW+W4bsTCaL6oYafaO2M7Mjthp9qoYmi+xMG4blvmu2ujMldZF88wVUy6XMRceyvz03DXNxtQu8NgS3SxKMqIgAABe37bNI9Mo7dIPOivLMgwjNgPp4WnOrdE06rsMaykYM1IlagaS5E/PZtBW55cJcicyM3InlwlW52bQT8+S5GoGUiUYM2spuww06q3Rac7p4TYDDCPLMjor0g8o7SPTts1e3wAAoiBKMt0s2BIu8MbUNc303Mr8Fx6XMVMuzBVF85XW6Myu2pb5bhuxMJovqhhp9o7YzsyO2Gn2qhiaL7EwbhuW+a7a6MyV1kXzzBVTLpcxFx7K/PTcNc3G1C7w2BLdLEoyoiAAAF7fts0j0yjt0g86K8syDCM2A+nhac6t0TTquwxrKRgzUiVqBpLkT89m0FbnlwlyJzIzcieXCVbnZtBPz5LkagZSJRgzaym7DDTqrdFpzunhNgMMI8syOivSDyjtI9O2zV7fAACiIEoy3SzYEi7wxtQ1zfTcyvwXHpcxUy7MFUXzldbozK7alvluG7Ewmi+qGGn2jtjOzI7YafaqGJovsTBuG5b5rtrozJXWRfPMFVMulzEXHsr89Nw1zcbULvDYEt0sSjKiIAAAXt+2zSPTKO3SDzoryzIMIzYD6eFpzq3RNOq7DGspGDNSJWoGkuRPz2bQVueXCXInMjNyJ5cJVudm0E/PkuRqBlIlGDNrKbsMNOqt0WnO6eE2AwwjyzI6K9IPKO0j07bNXt8AAKIgSjLdLNgSLvDG1DXN9NzK/BcelzFTLswVRfOV1ujMrtqW+W4bsTCaL6oYafaO2M7Mjthp9qoYmi+xMG4blvmu2ujMldZF88wVUy6XMRceyvz03DXNxtQu8NgS3SxKMqIgAABe37bNI9Mo7dIPOivLMgwjNgPp4WnOrdE06rsMaykYM1IlagaS5E/PZtBW55cJcicyM3InlwlW52bQT8+S5GoGUiUYM2spuww06q3Rac7p4TYDDCPLMjor0g8o7SPTts1e3wAAoiBKMt0s2BIu8MbUNc303Mr8Fx6XMVMuzBVF85XW6Myu2pb5bhuxMJovqhhp9o7YzsyO2Gn2qhiaL7EwbhuW+a7a6MyV1kXzzBVTLpcxFx7K/PTcNc3G1C7w2BLdLEoyoiAAAF7fts0j0yjt0g86K8syDCM2A+nhac6t0TTquwxrKRgzUiVqBpLkT89m0FbnlwlyJzIzcieXCVbnZtBPz5LkagZSJRgzaym7DDTqrdFpzunhNgMMI8syOivSDyjtI9O2zV7fAACiIEoy3SzYEi7wxtQ1zfTcyvwXHpcxUy7MFUXzldbozK7alvluG7Ewmi+qGGn2jtjOzI7YafaqGJovsTBuG5b5rtrozJXWRfPMFVMulzEXHsr89Nw1zcbULvDYEt0sSjKiIAAAXt+2zSPTKO3SDzoryzIMIzYD6eFpzq3RNOq7DGspGDNSJWoGkuRPz2bQVueXCXInMjNyJ5cJVudm0E/PkuRqBlIlGDNrKbsMNOqt0WnO6eE2AwwjyzI6K9IPKO0j07bNXt8AAKIgSjLdLNgSLvDG1DXN9NzK/BcelzFTLswVRfOV1ujMrtqW+W4bsTCaL6oYafaO2M7Mjthp9qoYmi+xMG4blvmu2ujMldZF88wVUy6XMQ==';

let cueSound: Audio.Sound | null = null;
let cueLoading: Promise<Audio.Sound> | null = null;

async function loadCueSound(): Promise<Audio.Sound> {
  if (cueSound) {
    return cueSound;
  }
  if (!cueLoading) {
    cueLoading = (async () => {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });
      const { sound } = await Audio.Sound.createAsync({ uri: CUE_URI });
      cueSound = sound;
      return sound;
    })();
  }
  return cueLoading;
}

export async function playCue(): Promise<void> {
  try {
    const sound = await loadCueSound();
    await sound.replayAsync();
  } catch (error) {
    // Ignore audio playback errors to avoid interrupting the session.
  }
}

export async function unloadCue(): Promise<void> {
  if (cueSound) {
    await cueSound.unloadAsync();
    cueSound = null;
    cueLoading = null;
  }
}
