import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  ScrollView,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Image,
  Platform,
  Alert,
} from "react-native";
import { AuthStackParamList } from "../../types/navigation";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  User,
} from "firebase/auth";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Layout,
  Text,
  TextInput,
  Button,
  useTheme,
  themeColor,
} from "react-native-rapi-ui";
import { SelectList } from "react-native-dropdown-select-list";
import { fontSize } from "react-native-rapi-ui/constants/typography";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { doc, setDoc, getFirestore } from "firebase/firestore";

export default function ({
  navigation,
}: NativeStackScreenProps<AuthStackParamList, "Register">) {
  const { isDarkmode, setTheme } = useTheme();
  const auth = getAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [display_name, setDisplayName] = useState<string>("");
  const [gender, setGender] = React.useState("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const data = [
    { key: "Male", value: "Male" },
    { key: "Female", value: "Female" },
    { key: "Non-Binary", value: "Non-Binary" },
    { key: "Gender Fludity", value: "Gender Fludity", disabled: true },
    { key: "Rather not say", value: "Rather not say" },
  ];
  const [selected, setSelected] = useState("");
  const [selectedYear, setSelectedYear] = useState("2020");
  const db = getFirestore();

  //Handle Error
  const [checkDisplayName, setCheckDisplayName] = useState<boolean>(true);
  const [isValidEmail, setValidEmail] = useState<boolean>(true);
  const [checkPassword, setCheckPassword] = useState<boolean>(true);
  const [passwordStrength, setPasswordStrength] = useState<string>("");

  const handleCheckDisplayName = (text: React.SetStateAction<string>) => {
    setDisplayName(text);
    if (text === "") {
      setCheckDisplayName(false);
    } else {
      setCheckDisplayName(true);
    }
  };

  const calculatePasswordStrength = (password) => {
    // Implement your logic to calculate password strength here
    // For simplicity, let's assume weak if the length is less than 6, moderate if less than 10, else strong
    if (password.length < 6) {
      return "Weak, even Firebase don't let this through LMAO";
    } else if (password.length < 10) {
      return "Moderate";
    } else {
      return "Strong";
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case "Weak, even Firebase don't let this through LMAO":
        return "red";
      case "Moderate":
        return "yellow";
      case "Strong":
        return "green";
      default:
        return "black";
    }
  };
  useEffect(() => {
    const strength = calculatePasswordStrength(password);
    setPasswordStrength(strength);
  }, [password]);

  useEffect(() => {
    if (password !== confirmPassword) {
      setCheckPassword(false);
    } else {
      setCheckPassword(true);
    }
  }, [confirmPassword, password]);

  const handleEmailChange = (text) => {
    setEmail(text);
    // Check email format using a regular expression
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setValidEmail(emailRegex.test(text));
  };

  const currentYear = new Date().getFullYear();
  const startYear = 1900;

  const yearOptions = Array.from(
    { length: currentYear - startYear + 1 },
    (_, index) => {
      const year = startYear + index;
      return { label: year.toString(), value: year.toString() };
    }
  );

  async function register() {
    setLoading(true);
    await createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        if (auth.currentUser) {
          const currentUser: User = auth.currentUser;
          //Profile Updated
          updateProfile(currentUser, {
            displayName: display_name,
            photoURL: "-",
          })
            .then(() => {
              setDoc(doc(db, "user", currentUser.uid), {
                email: currentUser.email,
                displayName: currentUser.displayName,
                photoURL: currentUser.photoURL,
                gender: gender,
                birthDate: selected,
                tokenId: "-",
              });
            })
            .catch((error) => {
              var errorCode = error.code;
              var errorMessage = error.message;
              // ...
              setLoading(false);
              if (Platform.OS === "ios" || Platform.OS === "android")
                Alert.alert(errorMessage);
              else alert(errorMessage);
            });
        }
      })
      .catch(function (error: any) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
        setLoading(false);

        if (Platform.OS === "ios" || Platform.OS === "android")
          Alert.alert(errorMessage);
        else alert(errorMessage);
      });
  }
  return (
    <KeyboardAvoidingView behavior="height" enabled style={{ flex: 1 }}>
      <Layout>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: isDarkmode ? "#17171E" : themeColor.white100,
            }}
          >
            <Image
              resizeMode="contain"
              style={{
                height: 220,
                width: 220,
              }}
              source={require("../../../assets/images/register.png")}
            />
          </View>
          <View
            style={{
              flex: 3,
              paddingHorizontal: 20,
              paddingBottom: 20,
              backgroundColor: isDarkmode ? themeColor.dark : themeColor.white,
            }}
          >
            <Text
              fontWeight="bold"
              size="h3"
              style={{
                alignSelf: "center",
                padding: 30,
              }}
            >
              Register
            </Text>
            <Text>Display Name</Text>
            <TextInput
              containerStyle={{ marginTop: 15 }}
              placeholder="Enter your name"
              value={display_name}
              autoCorrect={false}
              keyboardType="default"
              onChangeText={(text) => handleCheckDisplayName(text)}
            />
            {checkDisplayName ? (
              ""
            ) : (
              <Text style={{ color: "red", fontSize: 12.5, paddingTop: 4 }}>
                Please enter a valid display name
              </Text>
            )}

            <Text style={{ marginTop: 15 }}>Email</Text>
            <TextInput
              containerStyle={{ marginTop: 15 }}
              placeholder="Enter your email"
              value={email}
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={(text) => handleEmailChange(text)}
            />
            {isValidEmail ? (
              ""
            ) : (
              <Text style={{ color: "red", fontSize: 12.5, paddingTop: 4 }}>
                Incorrect Email Format !{" "}
              </Text>
            )}

            <Text style={{ marginTop: 15 }}>Password</Text>
            <TextInput
              containerStyle={{ marginTop: 15 }}
              placeholder="Enter your password"
              value={password}
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              secureTextEntry={true}
              onChangeText={(text) => setPassword(text)}
            />
            {password && (
              <Text
                style={{ color: getPasswordStrengthColor(), fontSize: 12.5, paddingTop: 4  }}
              >{`Password Strength: ${passwordStrength}`}</Text>
            )}
            <Text style={{ marginTop: 15 }}>Confirm Password</Text>
            <TextInput
              containerStyle={{ marginTop: 15 }}
              placeholder="Re-enter your password"
              value={confirmPassword}
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              secureTextEntry={true}
              onChangeText={(text) => setConfirmPassword(text)}
            />
            {checkPassword ? (
              ""
            ) : (
              <Text style={{ color: "red", fontSize: 12.5, paddingTop: 4 }}>
                Password does not match !
              </Text>
            )}
            <Text style={{ marginTop: 15 }}>Gender</Text>
            <SelectList
              boxStyles={{
                marginTop: 15,
                backgroundColor: isDarkmode ? "white" : "",
              }}
              setSelected={(val: React.SetStateAction<string>) =>
                setGender(val)
              }
              data={data}
              save="value"
              dropdownStyles={{ backgroundColor: "white" }}
              search={false}
            />
            <Text style={{ marginTop: 15 }}>Birth</Text>
            <SelectList
              boxStyles={{
                marginTop: 15,
                backgroundColor: isDarkmode ? "white" : "",
              }}
              placeholder="Please select a year"
              setSelected={(val) => setSelectedYear(val)}
              data={yearOptions}
              save="value"
              dropdownStyles={{ backgroundColor: "white" }}
              search={true}
            />
            <Calendar
              style={{
                borderWidth: 1,
                borderColor: "gray",
                marginTop: 15,
              }}
              key={selectedYear}
              onDayPress={(day) => {
                setSelected(day.dateString);
              }}
              minDate="1900"
              maxDate="2023"
              enableSwipeMonths={true}
              markedDates={{
                [selected]: {
                  selected: true,
                  disableTouchEvent: true,
                  selectedDotColor: "blue",
                },
              }}
              current={selectedYear}
            />
            <Button
              text={loading ? "Loading" : "Create an account"}
              onPress={() => {
                register();
              }}
              style={{
                marginTop: 20,
              }}
              disabled={loading}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 15,
                justifyContent: "center",
              }}
            >
              <Text size="md">Already have an account?</Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("Login");
                }}
              >
                <Text
                  size="md"
                  fontWeight="bold"
                  style={{
                    marginLeft: 5,
                  }}
                >
                  Login here
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 30,
                justifyContent: "center",
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  isDarkmode ? setTheme("light") : setTheme("dark");
                }}
              >
                <Text
                  size="md"
                  fontWeight="bold"
                  style={{
                    marginLeft: 5,
                  }}
                >
                  {isDarkmode ? "☀️ light theme" : "🌑 dark theme"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Layout>
    </KeyboardAvoidingView>
  );
}
