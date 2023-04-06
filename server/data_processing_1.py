import numpy as np
import pandas as pd
from sklearn import preprocessing
from sklearn.model_selection import train_test_split
from numbers import Number
import network


def init_dataset(rs, filename="dataset.csv"):

    benign_df = pd.read_csv(filename+'5.benign.csv')
    g_j_df = pd.read_csv(filename+'5.gafgyt.junk.csv')
    g_c_df = pd.read_csv(filename+'5.gafgyt.combo.csv')
    g_s_df = pd.read_csv(filename+'5.gafgyt.scan.csv')
    g_t_df = pd.read_csv(filename+'5.gafgyt.tcp.csv')
    g_u_df = pd.read_csv(filename+'5.gafgyt.udp.csv')
    m_a_df = pd.read_csv(filename+'5.mirai.ack.csv')
    m_sc_df = pd.read_csv(filename+'5.mirai.scan.csv')
    m_sy_df = pd.read_csv(filename+'5.mirai.syn.csv')
    m_u_df = pd.read_csv(filename+'5.mirai.udp.csv')
    m_u_p_df = pd.read_csv(filename+'5.mirai.udpplain.csv')
    
    benign_df['type'] = 'benign'
    m_u_df['type'] = 'mirai_udp'
    g_c_df['type'] = 'gafgyt_combo'
    g_j_df['type'] = 'gafgyt_junk'
    g_s_df['type'] = 'gafgyt_scan'
    g_t_df['type'] = 'gafgyt_tcp'
    g_u_df['type'] = 'gafgyt_udp'
    m_a_df['type'] = 'mirai_ack'
    m_sc_df['type'] = 'mirai_scan'
    m_sy_df['type'] = 'mirai_syn'
    m_u_p_df['type'] = 'mirai_udpplain'
    df = pd.concat([benign_df, m_u_df, g_c_df,
                g_j_df, g_s_df, g_t_df,
                g_u_df, m_a_df, m_sc_df,
                m_sy_df, m_u_p_df],
                axis=0, sort=False, ignore_index=True)
    
    df_scaled = preprocessing.scale(df)
    df_scaled = pd.DataFrame(df_scaled, columns=df.columns)
    df_scaled['Outcome'] = df['Outcome']

    df = df_scaled

    X = df.loc[:, df.columns != 'Outcome']
    y = df.loc[:, 'Outcome']
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=rs)
    training_data = [(np.reshape(x, (len(x), 1)), np.reshape(
        np.array(y), (1, 1))) for x, y in zip(np.array(X_train), y_train)]
    testing_data = [(np.reshape(x, (len(x), 1)), np.reshape(
        np.array(y), (1, 1))) for x, y in zip(np.array(X_test), y_test)]

    return training_data, testing_data, X_test, y_test, X_train, y_train


def get_accuracy(net, X_val, y_val):

    validation_data = [np.reshape(x, (len(x), 1)) for x in np.array(X_val)]
    rdata = range(len(validation_data))
    n = len(validation_data)
    accuracy = 100 - ((int(sum([abs(np.round(net.predict(validation_data[i])) - y_val.iloc[i]) for i in rdata])) / n) * 100)
    return accuracy


def analyze_results(results):
    n_simulations, n_edges, n_periods = np.shape(results)
    mean_accuracy = [[] for i in range(n_edges)]

    for e in range(n_edges):
        for t in range(n_periods):
            mean_accuracy[e].append(
                *[np.mean([results[s][e][t] for s in range(n_simulations)])])
    return mean_accuracy


def toInt(item, precision=1e12):
    if isinstance(item, list):
        return [toInt(x) for x in item]
    else:
        return int(item * precision)


def toFloat(item, precision=1e12):
    if isinstance(item, list):
        return [toFloat(x) for x in item]
    else:
        return float(int(item) / precision)


def toList(item):

    if isinstance(item, list) or isinstance(item, tuple):
        return [toList(x) for x in item]
    elif isinstance(item, np.ndarray):
        return toList(item.tolist())
    elif isinstance(item, Number):
        return item


def toNpArray(item):

    return [np.array(x) for x in item]
