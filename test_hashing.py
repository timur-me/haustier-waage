import bcrypt
import json
import subprocess
import os


def test_python_bcrypt():
    """Test Python's bcrypt implementation"""
    password = "TestPassword123!"

    # Generate salt and hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode(), salt)

    print("\nPython bcrypt test:")
    print(f"Password: {password}")
    print(f"Salt (base64): {salt.decode()}")
    print(f"Hash (base64): {hashed.decode()}")

    # Verify
    is_valid = bcrypt.checkpw(password.encode(), hashed)
    print(f"Verification result: {is_valid}")

    return {
        "password": password,
        "salt": salt.decode(),
        "hash": hashed.decode()
    }


def create_js_test_file(python_results):
    """Create a JavaScript test file"""
    js_code = f"""
const bcrypt = require('bcryptjs');

async function testJsBcrypt() {{
    const password = "{python_results['password']}";
    const pythonSalt = "{python_results['salt']}";
    const pythonHash = "{python_results['hash']}";

    console.log('\\nJavaScript bcryptjs test:');
    console.log('Password:', password);
    
    // Test with same salt as Python
    try {{
        const hash = await bcrypt.hash(password, pythonSalt);
        console.log('Hash with Python salt:', hash);
        console.log('Matches Python hash:', hash === pythonHash);
        
        // Verify using hash
        const isValid = await bcrypt.compare(password, hash);
        console.log('Verification result:', isValid);
    }} catch (error) {{
        console.log('Error using Python salt:', error.message);
    }}
    
    // Test with new salt
    const newSalt = await bcrypt.genSalt(10);
    console.log('\\nNew bcryptjs test:');
    console.log('Generated salt:', newSalt);
    const newHash = await bcrypt.hash(password, newSalt);
    console.log('Generated hash:', newHash);
    
    // Verify using new hash
    const isValidNew = await bcrypt.compare(password, newHash);
    console.log('Verification result with new hash:', isValidNew);
}}

testJsBcrypt();
"""

    with open('test_hashing.js', 'w') as f:
        f.write(js_code)


def main():
    print("Starting hashing comparison test...")

    # Run Python test
    python_results = test_python_bcrypt()

    # Create and run JavaScript test
    create_js_test_file(python_results)

    print("\nRunning JavaScript test...")
    subprocess.run(['node', 'test_hashing.js'])

    # Clean up
    os.remove('test_hashing.js')


if __name__ == "__main__":
    main()
