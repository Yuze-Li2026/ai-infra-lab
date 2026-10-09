module @matrix {
  func.func @matmul(%a: tensor<8x16xf32>, %b: tensor<16x4xf32>) -> tensor<8x4xf32> {
    %zero = arith.constant 0.0 : f32
    %empty = tensor.empty() : tensor<8x4xf32>
    %initial = linalg.fill ins(%zero : f32) outs(%empty : tensor<8x4xf32>) -> tensor<8x4xf32>
    %result = linalg.matmul ins(%a, %b : tensor<8x16xf32>, tensor<16x4xf32>) outs(%initial : tensor<8x4xf32>) -> tensor<8x4xf32>
    return %result : tensor<8x4xf32>
  }
}
