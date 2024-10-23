import Cube from "../objects/primitives/Cube";
import Primitive from "../objects/primitives/Primitive";

const getMinVertices = (obj: Cube): number[] => {
  const minVertices: number[] = [Infinity, Infinity, Infinity]; // Initialize with max values
  const positions = obj.figure.geometry.attributes.position.array;

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];

    if (x < minVertices[0]) minVertices[0] = x;
    if (y < minVertices[1]) minVertices[1] = y;
    if (z < minVertices[2]) minVertices[2] = z;
  }

  return minVertices;
};

const getMaxVertices = (obj: Cube): number[] => {
  const maxVertices: number[] = [-Infinity, -Infinity, -Infinity]; // Initialize with min values
  const positions = obj.figure.geometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    if (x > maxVertices[0]) maxVertices[0] = x;
    if (y > maxVertices[1]) maxVertices[1] = y;
    if (z > maxVertices[2]) maxVertices[2] = z;
  }
  return maxVertices;
};

const checkCollision = (obj1: Primitive, obj2: Primitive): boolean => {
  if (!obj1.boundingBox || !obj2.boundingBox) return false;

  const minVertices1 = getMinVertices(obj1.boundingBox);
  const maxVertices1 = getMaxVertices(obj1.boundingBox);
  const minVertices2 = getMinVertices(obj2.boundingBox);
  const maxVertices2 = getMaxVertices(obj2.boundingBox);

  return (
    minVertices1[0] <= maxVertices2[0] &&
    maxVertices1[0] >= minVertices2[0] &&
    minVertices1[1] <= maxVertices2[1] &&
    maxVertices1[1] >= minVertices2[1] &&
    minVertices1[2] <= maxVertices2[2] &&
    maxVertices1[2] >= minVertices2[2]
  );
};

export { checkCollision };
