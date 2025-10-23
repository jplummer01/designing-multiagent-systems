# Calculator Module

This Python module contains basic arithmetic functions:

- `add(a, b)`: Returns the sum of a and b.
- `subtract(a, b)`: Returns the difference between a and b.
- `multiply(a, b)`: Returns the product of a and b.
- `divide(a, b)`: Returns the quotient of a divided by b. Raises `ValueError` if b is zero.
- `power(base, exponent)`: Returns the base raised to the power of exponent.

## Usage

Import the module and call the functions:

```python
import calculator

print(calculator.add(2, 3))       # Output: 5
print(calculator.subtract(5, 3))  # Output: 2
print(calculator.multiply(3, 4))  # Output: 12
print(calculator.divide(10, 2))   # Output: 5.0
print(calculator.power(2, 3))     # Output: 8
```

## Exception Handling

The `divide` function will raise a `ValueError` if a division by zero is attempted.

## Testing

Unit tests are provided in `test_calculator.py` to verify the functionality of each function.