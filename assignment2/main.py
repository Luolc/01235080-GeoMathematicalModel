# 数据，其中每一行为 [x1, x2, x3, y]
DATA = [
    [4.62, 0.29, 8.70, 4.50],
    [5.50, 0.38, 10.41, 2.50],
    [5.85, 0.31, 9.10, 2.01],
    [4.89, 0.25, 6.90, 1.37],
    [5.75, 0.20, 4.82, 1.04],
    [9.31, 0.16, 4.79, 0.16],
    [3.37, 0.16, 3.74, 0.60],
    [7.94, 0.19, 3.81, 0.19],
    [8.61, 0.20, 3.97, 0.25],
    [9.58, 0.15, 3.26, 0.18],
    [10.00, 0.21, 3.25, 0.20],
    [9.63, 0.16, 3.11, 0.11],
    [9.00, 0.15, 3.64, 0.17],
    [9.32, 0.13, 2.11, 0.33],
    [9.62, 0.24, 7.83, 0.0012],
    [8.34, 0.16, 5.08, 0.41],
    [7.91, 0.49, 5.92, 0.41],
    [8.91, 0.24, 3.66, 0.2],
    [25.58, 0.12, 2.31, 0.23],
    [11.31, 0.07, 3.29, 0.005],
    [10.67, 0.05, 3.27, 0.01],
    [12.0, 0.01, 3.10, 0.20],
]


def new_zeros(n_rows, n_columns):
    """创建一个值全部为零的形状为 n_rows × n_columns 的矩阵。"""
    return [[0.] * n_columns for _ in range(n_rows)]


def F_alpha(N1, N2):
    """返回 F 分布在自由度为 N1, N2 时，alpha=0.001 时的临界值。
        这里只记录了作业中可能用到的临界值。"""
    return {
        (1, 17): 15.722226,
        (1, 18): 15.379306,
        (1, 19): 15.080841,
        (1, 20): 14.818776,
    }[(N1, N2)]


def covariance(samples):
    """返回给定数据的协方差矩阵。
        其中，samples 为一 N × M 矩阵，N 为样本数，M 为因子数。"""
    n_samples = len(samples)
    n_features = len(samples[0])

    m = new_zeros(n_features, n_features)

    for i in range(n_features):
        for j in range(n_features):
            sum_ij = sum(_[i] * _[j] for _ in samples)
            sum_i = sum(_[i] for _ in samples)
            sum_j = sum(_[j] for _ in samples)
            m[i][j] = sum_ij - sum_i * sum_j / n_samples
            m[i][j] /= n_samples

    return m


def R0(samples):
    """计算初始的相关系数矩阵。"""
    n_features = len(samples[0])

    # 计算协方差矩阵
    m = covariance(samples)

    for i in range(n_features):
        for j in range(n_features):
            if i != j:
                # 计算第 i 个和第 j 个因子的相关系数
                m[i][j] /= (m[i][i] * m[j][j]) ** 0.5

    # 所有关于自身的相关系数初始均为 1
    for i in range(n_features):
        m[i][i] = 1.

    return m


def transform(R, index):
    """对相关系数矩阵进行 L_index 变换。"""
    n_features = len(R)

    m = new_zeros(n_features, n_features)

    for i in range(n_features):
        for j in range(n_features):
            if i != index and j != index:
                m[i][j] = R[i][j] - R[i][index] * R[index][j] / R[index][index]

    for j in range(n_features):
        if j != index:
            m[index][j] = R[index][j] / R[index][index]

    for i in range(n_features):
        if i != index:
            m[i][index] = -R[i][index] / R[index][index]

    m[index][index] = 1 / R[index][index]

    return m


def stepwise_linear_regression(samples):
    """逐步线性回归。"""
    R = R0(samples)  # 计算初始相关系数矩阵
    n_samples = len(samples)  # 样本数
    n_features = len(samples[0])  # 因字数，包含y

    remaining = set(range(n_features - 1))  # 未被引入的自变量的下标
    selected = set()  # 已经引入的自变量的下标

    while remaining:
        P = [-1] * n_features
        for index in remaining:
            # 对所有未引入的自变量，计算偏回归平方和
            P[index] = R[index][-1] ** 2 / R[index][index]

        # 找到其中的最大值 P_max，并记录下标为 index
        P_max, index = max((val, idx) for idx, val in enumerate(P))

        # 做F检验
        F1 = P_max * (n_samples - 2 - len(selected)) / (R[-1][-1] - P_max)

        if F1 <= F_alpha(1, n_samples - 2 - len(selected)):
            # 当 F <= F_alpha，挑选结束，退出循环
            break
        else:
            # 当 F > F_alpha，引入下标为 index 的该因子
            remaining.remove(index)
            selected.add(index)

            # 对相关系数矩阵进行相应变换
            R = transform(R, index)

            # 重复尝试剔除因子
            # 这里的代码实现没有严格按教材中的公式
            # 由于刚刚被新加入的因子不可能被马上剔除
            # 因此在循环中也考虑新因子是不影响最终结果的
            # 这里的实现在保证正确的情况下比教材中的推导更简单
            while selected:
                P = [1] * n_features
                for index in selected:
                    # 对所有已引入的自变量，计算偏回归平方和
                    P[index] = R[index][-1] ** 2 / R[index][index]

                # 找到其中的最小值 P_min，并记录下标为 index
                P_min, index = min((val, idx) for idx, val in enumerate(P))

                # 做 F 检验
                F2 = P_min * (n_samples - 1 - len(selected)) / R[-1][-1]

                if F2 < F_alpha(1, n_samples - 1 - len(selected)):
                    # 当 F < F_alpha，剔除下标为 index 的该因子
                    remaining.add(index)
                    selected.remove(index)

                    # 对相关系数矩阵进行相应变换
                    R = transform(R, index)
                else:
                    # 当 F >= F_alpha，没有可剔除的因子，返回外层循环考虑引入新变量
                    break

    selected = sorted(selected)  # 对引入的变量按下标排序
    print('选择的自变量有：' + ', '.join(['x{}'.format(i + 1) for i in selected]))

    # 计算回归方程的系数
    cov = covariance(samples)
    b = [(cov[-1][-1] / cov[index][index]) ** 0.5 * R[index][-1] for index in selected]
    b0 = sum(_[-1] for _ in samples) / n_samples
    for index in selected:
        E_x = sum(_[index] for _ in samples) / n_samples
        b0 -= (cov[-1][-1] / cov[index][index]) ** 0.5 * R[index][-1] * E_x

    print('求得系数为：')
    print('  b0 = {}'.format(b0))
    for index, coef in zip(selected, b):
        print('  b{} = {}'.format(index + 1, coef))


if __name__ == '__main__':
    stepwise_linear_regression(DATA)
