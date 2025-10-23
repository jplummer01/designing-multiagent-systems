def add(a, b):
    """Return the sum of a and b.

    Args:
        a (float or int): First number.
        b (float or int): Second number.

    Returns:
        float or int: Sum of a and b.
    """
    return a + b


def subtract(a, b):
    """Return the difference of a and b.

    Args:
        a (float or int): First number.
        b (float or int): Second number.

    Returns:
        float or int: Difference of a and b.
    """
    return a - b


def multiply(a, b):
    """Return the product of a and b.

    Args:
        a (float or int): First number.
        b (float or int): Second number.

    Returns:
        float or int: Product of a and b.
    """
    return a * b


def divide(a, b):
    """Return the quotient of a divided by b.

    Args:
        a (float or int): Numerator.
        b (float or int): Denominator.

    Raises:
        ValueError: If b is zero.

    Returns:
        float: Quotient of a and b.
    """
    if b == 0:
        raise ValueError("Cannot divide by zero.")
    return a / b


def power(base, exponent):
    """Return the number base raised to the power of exponent.

    Args:
        base (float or int): The base number.
        exponent (float or int): The exponent to raise the base to.

    Returns:
        float or int: Result of base raised to exponent.
    """
    return base ** exponent

